"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
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
    const [remoteIsTyping, setRemoteIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const channelRef = useRef<any>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
                throw error
            }
            setMessages(data || [])
        } catch (error: any) {
            console.error("Caught error in fetchMessages:", error?.message || String(error))
        } finally {
            setIsLoading(false)
        }
    }

    const setLocalTyping = (isTyping: boolean) => {
        if (!channelRef.current) return
        channelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: currentUserId, isTyping }
        })
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
                const newMsg = payload.new as any
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev

                    const optimisticIndex = prev.findIndex(m =>
                        m.id.startsWith('temp-') &&
                        m.message === newMsg.message &&
                        m.sender_id === newMsg.sender_id
                    )

                    if (optimisticIndex !== -1) {
                        const newMsgs = [...prev]
                        newMsgs[optimisticIndex] = {
                            ...newMsg,
                            profiles: prev[optimisticIndex].profiles
                        }
                        return newMsgs
                    }

                    const tempWithPlaceholder = {
                        ...newMsg,
                        profiles: { full_name: "...", role: "user" }
                    }
                    setTimeout(fetchMessages, 100)
                    return [...prev, tempWithPlaceholder]
                })

                // Clear remote typing when message arrives
                if (newMsg.sender_id !== currentUserId) {
                    setRemoteIsTyping(false)
                }
            })
            .on('broadcast', { event: 'typing' }, (payload) => {
                const { userId, isTyping } = payload.payload
                if (userId !== currentUserId) {
                    setRemoteIsTyping(isTyping)
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                    if (isTyping) {
                        typingTimeoutRef.current = setTimeout(() => setRemoteIsTyping(false), 3000)
                    }
                }
            })
            .subscribe()

        channelRef.current = channel

        const interval = setInterval(fetchMessages, 10000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(interval)
            channelRef.current = null
        }
    }, [requestId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, remoteIsTyping])

    const handleSendMessage = async () => {
        const messageText = newMessage.trim()
        if (!messageText || !currentUserId) return

        setIsSending(true)
        setLocalTyping(false)

        const tempId = `temp-${Date.now()}`
        const tempMsg = {
            id: tempId,
            request_id: requestId,
            sender_id: currentUserId,
            message: messageText,
            created_at: new Date().toISOString(),
            is_internal: false,
            profiles: {
                full_name: "You",
                role: isAgent ? 'agent' : 'customer'
            }
        }

        setMessages(prev => [...prev, tempMsg])
        setNewMessage("")

        try {
            const { error } = await supabase
                .from('request_messages')
                .insert({
                    request_id: requestId,
                    sender_id: currentUserId,
                    message: messageText,
                    is_internal: false
                })

            if (error) {
                setMessages(prev => prev.filter(m => m.id !== tempId))
                throw error
            }

            try {
                const { data: request } = await supabase
                    .from('sourcing_requests')
                    .select('user_id, agent_id, part_name')
                    .eq('id', requestId)
                    .single()

                if (request) {
                    const isCustomer = currentUserId === request.user_id
                    const participantName = isAgent ? "Agent" : (isCustomer ? "Customer" : "Admin")

                    if (isCustomer || isAgent) {
                        await notifyAdminsAction({
                            title: `New Message on ${request.part_name}`,
                            message: `${participantName}: ${messageText.substring(0, 50)}...`,
                            type: 'sourcing',
                            link: `/portal/admin/requests?requestId=${requestId}`
                        })
                    }

                    const targetId = isCustomer ? request.agent_id : request.user_id
                    if (targetId && targetId !== currentUserId) {
                        await sendNotificationAction({
                            userId: targetId,
                            title: `New Message: ${request.part_name}`,
                            message: messageText.substring(0, 100),
                            type: 'sourcing',
                            link: isCustomer ? `/portal/agent/messages?requestId=${requestId}` : `/portal/customer/messages?requestId=${requestId}`
                        })
                    }
                }
            } catch (notifyErr) {
                console.warn('Chat notification relay failed:', notifyErr)
            }
        } catch (error) {
            console.error("Error sending message:", error)
            toast.error("Failed to send message")
        } finally {
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
        <div className="flex flex-col h-full bg-slate-50/30 overflow-hidden relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 tracking-tight leading-none text-sm">Direct Messages</h4>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 pt-1">Live Updates</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-32" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 opacity-70">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                            <MessageSquare className="h-6 w-6 text-slate-300" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-center leading-relaxed">No messages found.<br />Start the conversation block.</span>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId
                            const role = msg.profiles?.role

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={cn("flex gap-3 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}
                                >
                                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white shadow-sm shrink-0 mt-1">
                                        <AvatarImage src={msg.profiles?.avatar_url} />
                                        <AvatarFallback className={cn("text-[10px] font-bold", isMe ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600")}>
                                            {msg.profiles?.full_name?.substring(0, 2).toUpperCase() || "??"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn("space-y-1", isMe ? "items-end" : "items-start")}>
                                        <div className={cn("flex items-center gap-2", isMe ? "flex-row-reverse" : "")}>
                                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                                                {isMe ? "You" : (msg.profiles?.full_name || "User")}
                                            </span>
                                            <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest",
                                                role === 'agent' ? "bg-purple-100 text-purple-700 border-purple-200" :
                                                    role === 'admin' ? "bg-red-100 text-red-700 border-red-200" :
                                                        "bg-blue-100 text-blue-700 border-blue-200"
                                            )}>
                                                {role}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400">
                                                {msg.created_at ? format(new Date(msg.created_at), 'h:mm a') : '...'}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "p-4 px-5 text-[13px] font-medium leading-relaxed shadow-sm",
                                            isMe
                                                ? "bg-slate-900 text-white rounded-2xl rounded-tr-sm"
                                                : "bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-sm ring-1 ring-slate-900/5"
                                        )}>
                                            {msg.message}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                        {remoteIsTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-slate-400 italic text-[10px] pl-2 mt-2"
                            >
                                <div className="flex gap-1">
                                    <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" />
                                </div>
                                <span className="font-bold tracking-[0.1em] uppercase text-[9px] text-slate-400">Typing...</span>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* Input Area (Chat Pill Design) */}
            <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end gap-2 bg-white/90 backdrop-blur-md p-2 rounded-[24px] shadow-xl ring-1 ring-slate-900/5 transition-all focus-within:ring-slate-900/10 focus-within:shadow-2xl">
                    <Textarea
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value)
                            setLocalTyping(true)
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 text-slate-900 placeholder:text-slate-400 py-3 px-4 shadow-none"
                    />
                    <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={isSending || !newMessage.trim()}
                        className="h-[44px] w-[44px] rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-md transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                    >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
