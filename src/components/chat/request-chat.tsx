"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { Loader2, Send, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"
import { sendNotificationAction, notifyAdminsAction } from "@/app/actions/notification-actions"

interface RequestChatProps {
    requestId: string
    requestTitle: string
    currentUserId: string
    isAgent?: boolean
}

export function RequestChat({ requestId, requestTitle, currentUserId, isAgent = false }: RequestChatProps) {
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

            if (error) throw error
            setMessages(data || [])
        } catch (error: any) {
            console.error("Error fetching request messages:", error)
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
                    // Check if message already exists (to avoid duplicates from fetchMessages or optimistic)
                    if (prev.some(m => m.id === newMsg.id)) return prev

                    // Try to match and replace optimistic message
                    const optimisticIndex = prev.findIndex(m =>
                        m.id.startsWith('temp-') &&
                        m.message === newMsg.message &&
                        m.sender_id === newMsg.sender_id
                    )

                    if (optimisticIndex !== -1) {
                        const newMsgs = [...prev]
                        newMsgs[optimisticIndex] = {
                            ...newMsg,
                            profiles: prev[optimisticIndex].profiles // Preserve profiles if optimistic had it
                        }
                        return newMsgs
                    }

                    // Add immediately for receiver even without profile (will fill with placeholder)
                    const tempWithPlaceholder = {
                        ...newMsg,
                        profiles: { full_name: "...", role: "user" }
                    }
                    setTimeout(fetchMessages, 100) // Re-fetch to get real profile data
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

                    // Auto-clear after 3 seconds if no more events
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                    if (isTyping) {
                        typingTimeoutRef.current = setTimeout(() => setRemoteIsTyping(false), 3000)
                    }
                }
            })
            .subscribe()

        channelRef.current = channel

        // Polling fallback
        const interval = setInterval(fetchMessages, 10000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(interval)
            channelRef.current = null
        }
    }, [requestId])

    // Auto-scroll to bottom
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

        // Optimistic Update
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
                // Revert optimism on error
                setMessages(prev => prev.filter(m => m.id !== tempId))
                throw error
            }

            // Trigger Notifications
            try {
                const { data: request } = await supabase
                    .from('sourcing_requests')
                    .select('user_id, agent_id, part_name')
                    .eq('id', requestId)
                    .single()

                if (request) {
                    const isCustomer = currentUserId === request.user_id
                    const participantName = isAgent ? "Agent" : (isCustomer ? "Customer" : "Admin")

                    // Notify Admins
                    if (isCustomer || isAgent) {
                        await notifyAdminsAction({
                            title: `New Message on ${request.part_name}`,
                            message: `${participantName}: ${messageText.substring(0, 50)}...`,
                            type: 'sourcing',
                            link: `/portal/admin/requests?requestId=${requestId}`
                        })
                    }

                    // Notify Counter-party
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
                console.warn('Notification relay failed:', notifyErr)
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
        <div className="flex flex-col h-full bg-slate-50/30">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 text-[9px]">
                <div>
                    <h2 className="font-bold text-slate-800 text-sm leading-none mb-1">{requestTitle}</h2>
                    <p className="text-slate-500 font-medium uppercase tracking-wider">Request ID: {requestId.substring(0, 8)}</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-xs font-medium uppercase tracking-widest">Loading thread...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 opacity-60">
                        <MessageSquare className="h-10 w-10" />
                        <p className="text-xs font-medium uppercase tracking-widest">No messages yet</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId
                            const role = msg.profiles?.role

                            return (
                                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-slate-600">
                                            {isMe ? "You" : (msg.profiles?.full_name || "User")}
                                        </span>
                                        {!isMe && (
                                            <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border",
                                                role === 'agent' ? "bg-purple-100 text-purple-700 border-purple-200" :
                                                    role === 'admin' ? "bg-red-100 text-red-700 border-red-200" :
                                                        "bg-blue-100 text-blue-700 border-blue-200"
                                            )}>
                                                {role}
                                            </span>
                                        )}
                                        <span className="text-[9px] text-slate-400">
                                            {format(new Date(msg.created_at), 'h:mm a')}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                                        isMe ? "bg-primary-blue text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                                    )}>
                                        {msg.message}
                                    </div>
                                </div>
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
                                <span className="font-semibold tracking-wide uppercase text-[9px]">Someone is typing...</span>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 max-w-4xl mx-auto items-end">
                    <Textarea
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value)
                            setLocalTyping(true)
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="min-h-[44px] max-h-32 resize-none rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-sm py-3"
                    />
                    <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={isSending || !newMessage.trim()}
                        className="h-11 w-11 rounded-xl bg-primary-blue hover:bg-blue-700 shrink-0 shadow-sm transition-all active:scale-95"
                    >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
