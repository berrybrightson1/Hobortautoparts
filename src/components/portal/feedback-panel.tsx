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
    const [requestDetails, setRequestDetails] = useState<any>(null)
    const [newMessage, setNewMessage] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [remoteIsTyping, setRemoteIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const channelRef = useRef<any>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const mountedRef = useRef(true)

    useEffect(() => {
        mountedRef.current = true
        return () => { mountedRef.current = false }
    }, [])

    const fetchMessages = async () => {
        if (!requestId) {
            console.warn("FeedbackPanel: requestId is missing")
            if (mountedRef.current) setIsLoading(false)
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
                throw error
            }

            const { data: requestData, error: reqError } = await supabase
                .from('sourcing_requests')
                .select(`
                    id, 
                    part_name, 
                    vehicle_info, 
                    customer_phone, 
                    customer_name, 
                    profiles:user_id(full_name, phone_number)
                 `)
                .eq('id', requestId)
                .single()

            if (!reqError && requestData) {
                setRequestDetails(requestData)
            }

            if (mountedRef.current) setMessages(data || [])
        } catch (error: any) {
            // Ignore AbortError which happens naturally when a component unmounts or StrictMode double mounts
            if (error?.name === 'AbortError' || error?.message?.includes('AbortError') || String(error).includes('is aborted')) {
                // Silently ignore abort errors
                return
            }
            console.error("Caught error in fetchMessages:", error?.message || String(error))
        } finally {
            if (mountedRef.current) setIsLoading(false)
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
        // Reset loading state whenever requestId changes
        setIsLoading(true)
        fetchMessages()

        // Safety timeout: if fetch hangs for 8s, clear the spinner so the user isn't stuck
        const loadingTimeout = setTimeout(() => {
            if (mountedRef.current) setIsLoading(false)
        }, 8000)

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
            clearTimeout(loadingTimeout)
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

    const handleWhatsAppFollowUp = () => {
        if (!requestDetails) return;

        const custName = requestDetails.customer_name || requestDetails.profiles?.full_name || 'Customer';
        const phoneRaw = requestDetails.customer_phone || requestDetails.profiles?.phone_number || '';
        let phoneUrl = phoneRaw.replace(/[^0-9]/g, ''); // Strip non-numeric

        // Auto-format local Ghanaian numbers (e.g., 0200118870 -> 233200118870)
        // Also handling the case where users typed 233200118870 directly
        if (phoneUrl.length === 10 && phoneUrl.startsWith('0')) {
            phoneUrl = '233' + phoneUrl.substring(1);
        } else if (phoneUrl.length === 9 && !phoneUrl.startsWith('0') && !phoneUrl.startsWith('233')) {
            phoneUrl = '233' + phoneUrl; // Handle numbers typed as 200118870
        }
        // If it already starts with 233 and is 12 digits, it's correct.

        if (!phoneUrl) {
            toast.error("No phone number found for this customer.", {
                description: "Cannot open WhatsApp without a valid number."
            });
            return;
        }

        const msg = `Hello ${custName},

This is Hobort Auto Express following up on your sourcing request.

*Request Details:*
• Part: ${requestDetails.part_name}
• Vehicle: ${requestDetails.vehicle_info || 'N/A'}
• Ref: ${requestId.slice(0, 8)}

How can we assist you today?`;
        const encodedMsg = encodeURIComponent(msg);

        window.open(`https://wa.me/${phoneUrl}?text=${encodedMsg}`, '_blank');
    }

    return (
        <div className="flex flex-col flex-1 h-full w-full bg-slate-50/30 overflow-hidden relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="font-medium text-slate-900 tracking-tight leading-none text-sm">Direct Messages</h4>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 pt-1">Live Updates</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-6" ref={scrollRef}>
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
                        <span className="text-[10px] uppercase tracking-[0.2em] text-center leading-relaxed mb-2">No messages found.<br />Start the conversation block.</span>
                        {isAgent && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleWhatsAppFollowUp}
                                className="border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 rounded-xl"
                            >
                                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                Follow up on WhatsApp
                            </Button>
                        )}
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
                                        <AvatarFallback className={cn("text-[10px]", isMe ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600")}>
                                            {msg.profiles?.full_name?.substring(0, 2).toUpperCase() || "??"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn("space-y-1", isMe ? "items-end" : "items-start")}>
                                        <div className={cn("flex items-center gap-2", isMe ? "flex-row-reverse" : "")}>
                                            <span className="text-[10px] font-medium text-slate-700 uppercase tracking-wide">
                                                {isMe ? "You" : (msg.profiles?.full_name || "User")}
                                            </span>
                                            <span className={cn("text-[8px] font-medium uppercase px-2 py-0.5 rounded-full border tracking-widest",
                                                role === 'agent' ? "bg-purple-100 text-purple-700 border-purple-200" :
                                                    role === 'admin' ? "bg-red-100 text-red-700 border-red-200" :
                                                        "bg-blue-100 text-blue-700 border-blue-200"
                                            )}>
                                                {role}
                                            </span>
                                            <span className="text-[9px] font-medium text-slate-400">
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
            <div className="pt-8 bg-white/40 backdrop-blur-xl border-t border-slate-200/40 mt-auto shrink-0 z-10 flex flex-col lg:rounded-br-2xl">
                <div className="px-6 pb-2">
                    <div className="flex items-end gap-2 bg-white/90 p-2 rounded-[24px] shadow-xl ring-1 ring-slate-900/5 transition-all focus-within:ring-slate-900/10 focus-within:shadow-2xl">
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

                {/* External WhatsApp Trigger Formatted Below the Chat */}
                {isAgent && (
                    <div className="px-6 pb-6 pt-2">
                        <Button
                            onClick={handleWhatsAppFollowUp}
                            className="w-full h-14 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95 group border-none flex items-center justify-center gap-3"
                            title="Follow up on WhatsApp"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            Follow up on WhatsApp
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
