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
    const [guestId, setGuestId] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const channelRef = useRef<any>(null)

    // Handle Guest ID Persistence
    useEffect(() => {
        if (!user && !isAdmin) {
            let gid = localStorage.getItem('hobort_guest_id')
            if (!gid) {
                gid = `guest-${Math.random().toString(36).substring(2, 11)}`
                localStorage.setItem('hobort_guest_id', gid)
            }
            setGuestId(gid)

            // Load existing guest messages from localStorage
            const stored = localStorage.getItem(`hobort_chat_${gid}`)
            if (stored) {
                try {
                    setMessages(JSON.parse(stored))
                } catch (e) {
                    console.error("Failed to parse guest messages")
                }
            }
        } else {
            setGuestId(null)
        }
    }, [user, isAdmin])

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
        }, 100)
    }

    // Broadcast typing status
    const setLocalTyping = useCallback((isTyping: boolean) => {
        const activeId = user?.id || guestId
        if (!channelRef.current || !activeId) return

        channelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: activeId, isTyping }
        })
    }, [user, guestId])

    // Fetch Messages & Realtime
    useEffect(() => {
        const activeId = user?.id || guestId
        if (!activeId || !isOpen) return

        // If Admin is in 'list' view (no selected user), don't fetch chat messages
        if (isAdmin && !selectedUser) return

        // Target ID: If admin, filter by selectedUser. If customer, filter by self
        const targetUserId = isAdmin ? selectedUser?.id : activeId
        if (isAdmin && !targetUserId) return

        const fetchMessages = async () => {
            if (!user && guestId) {
                // For guests, we mostly rely on localStorage, but we can attempt to fetch 
                // if they previously sent messages that were stored in DB (using guestId)
                setIsLoading(true)
                const { data } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`sender_id.eq.${guestId},recipient_id.eq.${guestId}`)
                    .order('created_at', { ascending: true })

                if (data && data.length > 0) {
                    setMessages(data)
                    localStorage.setItem(`hobort_chat_${guestId}`, JSON.stringify(data))
                }
                setIsLoading(false)
                scrollToBottom()
                return
            }

            setIsLoading(true)
            let query = supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true })

            if (isAdmin && selectedUser) {
                // Fetch interaction between Admin and Selected User (handles both registered and guest users)
                query = query.or(`and(sender_id.eq.${selectedUser.id},recipient_id.eq.${user?.id}),and(sender_id.eq.${user?.id},recipient_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},recipient_id.is.null)`)
            } else {
                // Customer: RLS handles it
                query = query.limit(100)
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
                const myId = user?.id || guestId

                // Helper to check relevance
                const isRelevant = isAdmin && selectedUser
                    ? (newMsg.sender_id === selectedUser.id || newMsg.recipient_id === selectedUser.id || (newMsg.sender_id === myId && newMsg.recipient_id === selectedUser.id))
                    : (newMsg.sender_id === myId || newMsg.recipient_id === myId)

                if (isRelevant) {
                    setMessages(prev => {
                        // Optimistic Deduplication
                        const filtered = prev.filter(m =>
                            !(m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_id === newMsg.sender_id)
                        )
                        if (filtered.some(m => m.id === newMsg.id)) return filtered
                        const updated = [...filtered, newMsg]

                        // Sync guests to localStorage
                        if (!user && guestId) {
                            localStorage.setItem(`hobort_chat_${guestId}`, JSON.stringify(updated))
                        }

                        return updated
                    })
                    scrollToBottom()
                    // Clear remote typing when message arrives
                    if (newMsg.sender_id !== myId) {
                        setRemoteIsTyping(false)
                    }
                }
            })
            .on('broadcast', { event: 'typing' }, (payload) => {
                const { userId, isTyping } = payload.payload
                const myId = user?.id || guestId
                if (userId !== myId) {
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
    }, [user, guestId, isOpen, isAdmin, selectedUser])

    const sendMessage = async (content: string) => {
        const activeId = user?.id || guestId
        if (!content.trim() || !activeId) return

        const text = content.trim()

        // Optimistic Update
        const tempId = `temp-${Date.now()}`
        const tempMsg: Message = {
            id: tempId,
            content: text,
            sender_id: activeId,
            created_at: new Date().toISOString()
        }

        setMessages(prev => {
            const updated = [...prev, tempMsg]
            if (!user && guestId) {
                localStorage.setItem(`hobort_chat_${guestId}`, JSON.stringify(updated))
            }
            return updated
        })
        scrollToBottom()
        setLocalTyping(false)

        const payload: any = {
            content: text,
            sender_id: activeId
        }

        if (isAdmin && selectedUser) {
            payload.recipient_id = selectedUser.id
        }

        // 1. Send Message
        const { error } = await supabase.from('messages').insert(payload)

        if (error) {
            console.error("Failed to send message:", error)
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempId)
                if (!user && guestId) {
                    localStorage.setItem(`hobort_chat_${guestId}`, JSON.stringify(filtered))
                }
                return filtered
            })
            return
        }

        // 2. Trigger Notification for the recipient
        try {
            if (isAdmin && selectedUser) {
                // Admin sending to user/guest
                await sendNotificationAction({
                    userId: selectedUser.id,
                    title: "New Support Message",
                    message: text.substring(0, 100),
                    type: 'promo',
                    link: selectedUser.id.startsWith('guest-') ? '#' : '/portal/customer/messages'
                })
            } else if (activeId) {
                // Customer or Guest sending to admin
                await notifyAdminsAction({
                    title: "New Live Support Message",
                    message: `${isAdmin ? 'Support' : activeId.substring(0, 8)}: ${text.substring(0, 50)}`,
                    type: 'system',
                    link: `/portal/admin/live-support?userId=${activeId}`
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
