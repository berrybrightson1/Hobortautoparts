import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { sendNotificationAction, notifyAdminsAction } from "@/app/actions/notification-actions"

export interface Message {
    id: string
    content: string
    sender_id: string
    recipient_id?: string | null
    created_at: string
}

export function useChat(
    user: { id: string } | null,
    isAdmin: boolean,
    selectedUser: { id: string } | null,
    isOpen: boolean = true
) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [remoteIsTyping, setRemoteIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const channelRef = useRef<any>(null)

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
        }, 100)
    }

    // Broadcast typing status
    const setLocalTyping = useCallback((isTyping: boolean) => {
        if (!channelRef.current || !user) return

        channelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: user.id, isTyping }
        })
    }, [user])

    // Fetch Messages & Realtime
    useEffect(() => {
        if (!user || !isOpen) return

        // If Admin is in 'list' view (no selected user), don't fetch chat messages
        if (isAdmin && !selectedUser) return

        // Target ID: If admin, filter by selectedUser. If customer, filter by self
        const targetUserId = isAdmin ? selectedUser?.id : user.id
        if (isAdmin && !targetUserId) return

        const fetchMessages = async () => {
            setIsLoading(true)
            let query = supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true })

            if (isAdmin && selectedUser) {
                // Fetch interaction between Admin and Selected User
                query = query.or(`and(sender_id.eq.${selectedUser.id},recipient_id.eq.${user.id}),and(sender_id.eq.${user.id},recipient_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},recipient_id.is.null)`)
            } else {
                // Customer: RLS handles it, or we can just fetch all we can see
                query = query.limit(50)
            }

            const { data } = await query

            if (data) {
                setMessages(data)
                scrollToBottom()
            }
            setIsLoading(false)
        }

        fetchMessages()

        // Realtime Subscription
        const channel = supabase
            .channel(`chat:${targetUserId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const newMsg = payload.new as Message

                // Helper to check relevance
                const isRelevant = isAdmin && selectedUser
                    ? (newMsg.sender_id === selectedUser.id || newMsg.recipient_id === selectedUser.id || (newMsg.sender_id === user.id && newMsg.recipient_id === selectedUser.id))
                    : true // Customer receives all their own messages via RLS usually

                if (isRelevant) {
                    setMessages(prev => {
                        // Optimistic Deduplication
                        const filtered = prev.filter(m =>
                            !(m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_id === newMsg.sender_id)
                        )
                        if (filtered.some(m => m.id === newMsg.id)) return filtered
                        return [...filtered, newMsg]
                    })
                    scrollToBottom()
                    // Clear remote typing when message arrives
                    if (newMsg.sender_id !== user.id) {
                        setRemoteIsTyping(false)
                    }
                }
            })
            .on('broadcast', { event: 'typing' }, (payload) => {
                const { userId, isTyping } = payload.payload
                if (userId !== user.id) {
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

        return () => {
            supabase.removeChannel(channel)
            channelRef.current = null
        }
    }, [user, isOpen, isAdmin, selectedUser])

    const sendMessage = async (content: string) => {
        if (!content.trim() || !user) return

        const text = content.trim()

        // Optimistic Update
        const tempId = `temp-${Date.now()}`
        const tempMsg: Message = {
            id: tempId,
            content: text,
            sender_id: user.id,
            created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, tempMsg])
        scrollToBottom()
        setLocalTyping(false)

        const payload: any = {
            content: text,
            sender_id: user.id
        }

        if (isAdmin && selectedUser) {
            payload.recipient_id = selectedUser.id
        }

        // 1. Send Message
        const { error } = await supabase.from('messages').insert(payload)

        if (error) {
            console.error("Failed to send message:", error)
            setMessages(prev => prev.filter(m => m.id !== tempId))
            return
        }

        // 2. Trigger Notification for the recipient
        try {
            if (isAdmin && selectedUser) {
                // Admin sending to user
                await sendNotificationAction({
                    userId: selectedUser.id,
                    title: "New Support Message",
                    message: text.substring(0, 100),
                    type: 'promo',
                    link: '/portal/customer/messages'
                })
            } else if (!isAdmin) {
                // Customer sending to admin
                await notifyAdminsAction({
                    title: "New Live Support Message",
                    message: `${user.id.substring(0, 8)}: ${text.substring(0, 50)}`,
                    type: 'system',
                    link: `/portal/admin/live-support?userId=${user.id}`
                })
            }
        } catch (err) {
            console.warn("Failed to send notification relay:", err)
        }
    }

    return {
        messages,
        sendMessage,
        isLoading,
        scrollRef,
        remoteIsTyping,
        setLocalTyping
    }
}
