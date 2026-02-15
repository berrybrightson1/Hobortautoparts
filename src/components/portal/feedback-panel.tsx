"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { Loader2, Send, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"
import { sendNotificationAction, notifyAdminsAction } from "@/app/actions/notification-actions"

interface FeedbackPanelProps {
    requestId: string
    currentUserId: string
    isAgent?: boolean
}

export function FeedbackPanel({ requestId, currentUserId, isAgent = false }: FeedbackPanelProps) {
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const fetchMessages = async () => {
        if (!requestId) {
            console.warn("FeedbackPanel: requestId is missing")
            setIsLoading(false)
            return
        }
        try {
            const { data, error } = await supabase
                .from('request_messages')
                .select(`
                    *,
                    profiles:sender_id (full_name, role, avatar_url)
                `)
                .eq('request_id', requestId)
                .order('created_at', { ascending: true })

            if (error) {
                console.error("Supabase Error [String]:", error.message || String(error))
                console.error("Supabase Error [Full]:", JSON.stringify(error, null, 2))
                throw error
            }
            setMessages(data || [])
        } catch (error: any) {
            console.error("Caught error in fetchMessages:", error?.message || String(error))
            console.error("Caught error [Full]:", JSON.stringify(error, null, 2))
        } finally {
            setIsLoading(false)
        }
    }

    // Subscribe to new messages
    useEffect(() => {
        fetchMessages()

        const channel = supabase
            .channel(`request_messages:${requestId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'request_messages',
                filter: `request_id=eq.${requestId}`
            }, (payload) => {
                // Optimistically fetch or just append if we had the full profile data in payload (we don't)
                fetchMessages()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [requestId])

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUserId) return

        setIsSending(true)

        // Hard timeout to prevent "loading forever"
        const timeoutId = setTimeout(() => {
            if (isSending) {
                setIsSending(false)
                toast.error("Message Latency", {
                    description: "Your message is taking longer than usual to send. Please check your connection."
                })
            }
        }, 30000)

        try {
            const { error } = await supabase
                .from('request_messages')
                .insert({
                    request_id: requestId,
                    sender_id: currentUserId,
                    message: newMessage.trim(),
                    is_internal: false // For now, all messages are visible to both parties
                })

            if (error) throw error

            // 2. Trigger Notifications
            try {
                // Fetch request metadata to identify participants
                const { data: request } = await supabase
                    .from('sourcing_requests')
                    .select('user_id, agent_id, part_name')
                    .eq('id', requestId)
                    .single()

                if (request) {
                    const isCustomer = currentUserId === request.user_id
                    const participantName = isAgent ? "Agent" : (isCustomer ? "Customer" : "Admin")

                    // Notify Admins (Always, if from customer or agent)
                    if (isCustomer || isAgent) {
                        await notifyAdminsAction({
                            title: `New Message on ${request.part_name}`,
                            message: `${participantName}: ${newMessage.trim().substring(0, 50)}${newMessage.length > 50 ? '...' : ''}`,
                            type: 'system'
                        })
                    }

                    // Notify Counter-party
                    const targetId = isCustomer ? request.agent_id : request.user_id
                    if (targetId && targetId !== currentUserId) {
                        await sendNotificationAction({
                            userId: targetId,
                            title: `New Message: ${request.part_name}`,
                            message: newMessage.trim().substring(0, 100),
                            type: 'system'
                        })
                    }
                }
            } catch (notifyErr) {
                console.warn('Chat notification relay failed:', notifyErr)
            }

            setNewMessage("")
        } catch (error) {
            console.error("Error sending message:", error)
            toast.error("Failed to send message")
        } finally {
            clearTimeout(timeoutId)
            setIsSending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary-blue shadow-inner">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 tracking-tight leading-none uppercase text-xs">Messages</h4>
                        <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-slate-400 pt-1.5">Direct communication</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest">Loading history...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4 opacity-50">
                        <MessageSquare className="h-12 w-12" />
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-center">No messages yet.<br />Start the conversation.</span>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId
                        // Determine if sender is 'Agent' or 'Customer' based on role (simple heuristic or use role from join)
                        const role = msg.profiles?.role
                        const isSystem = role === 'admin'

                        return (
                            <div key={msg.id} className={cn("flex gap-3 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white shadow-sm shrink-0">
                                    <AvatarImage src={msg.profiles?.avatar_url} />
                                    <AvatarFallback className={cn("text-[10px] font-bold", isMe ? "bg-primary-blue text-white" : "bg-slate-200 text-slate-600")}>
                                        {msg.profiles?.full_name?.substring(0, 2).toUpperCase() || "??"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={cn("space-y-1", isMe ? "items-end" : "items-start")}>
                                    <div className={cn("flex items-center gap-2", isMe ? "flex-row-reverse" : "")}>
                                        <span className="text-[11px] font-semibold text-slate-700">
                                            {isMe ? "You" : (msg.profiles?.full_name || "User")}
                                        </span>
                                        <span className={cn("text-[8px] font-medium uppercase px-2 py-0.5 rounded-full border",
                                            role === 'agent' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                                role === 'admin' ? "bg-red-50 text-red-600 border-red-100" :
                                                    "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>
                                            {role}
                                        </span>
                                        <span className="text-[9px] font-medium text-slate-400">
                                            {msg.created_at ? format(new Date(msg.created_at), 'h:mm a') : '...'}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-2xl text-[13px] font-medium leading-relaxed",
                                        isMe ? "bg-primary-blue text-white rounded-tr-none" : "bg-slate-50 text-slate-600 border border-slate-100 rounded-tl-none"
                                    )}>
                                        {msg.message}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 bg-white border-t border-slate-100">
                <div className="flex items-end gap-2">
                    <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="min-h-[3rem] max-h-32 resize-none rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 py-3"
                    />
                    <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={isSending || !newMessage.trim()}
                        className="h-12 w-12 rounded-xl bg-primary-blue hover:bg-blue-700 text-white shrink-0 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                    >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
                    </Button>
                </div>
                <p className="text-[10px] text-slate-300 text-center pt-4 font-medium uppercase tracking-widest opacity-60">
                    Press <kbd className="font-mono bg-slate-50 px-1.5 rounded border border-slate-100">Enter</kbd> to send
                </p>
            </div>
        </div>
    )
}
