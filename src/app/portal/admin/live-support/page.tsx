"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Send, Search, MessageSquare, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"

interface Message {
    id: string
    content: string
    sender_id: string
    recipient_id: string | null
    created_at: string
    is_read: boolean
}

interface ChatUser {
    id: string
    email?: string // Email might not be available in profiles
    full_name: string | null
    avatar_url?: string
    last_message?: Message
    unread_count?: number
}

function SupportContent() {
    const { user: adminUser } = useAuth()
    const [activeUsers, setActiveUsers] = React.useState<ChatUser[]>([])
    const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)
    const [messages, setMessages] = React.useState<Message[]>([])
    const [newMessage, setNewMessage] = React.useState("")
    const [isLoadingUsers, setIsLoadingUsers] = React.useState(true)
    const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)
    const searchParams = useSearchParams()
    const targetUserId = searchParams.get('userId')
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // Initial selected user from URL
    React.useEffect(() => {
        if (targetUserId) {
            setSelectedUserId(targetUserId)
        }
    }, [targetUserId])

    // 1. Fetch Users who have chatted
    React.useEffect(() => {
        const fetchActiveUsers = async () => {
            // Fetch all messages to identify unique senders
            // Note: In production, this should be a dedicated RPC or view for performance
            // "Select distinct sender_id from messages where sender_id != admin_id"
            const { data: messagesData, error } = await supabase
                .from('messages')
                .select('sender_id, recipient_id, content, created_at, is_read')
                .order('created_at', { ascending: false })

            if (messagesData) {
                const userIds = new Set<string>()
                const latestMessages = new Map<string, Message>()

                messagesData.forEach((msg: any) => {
                    // We are looking for users who talked to us. 
                    // If sender is NOT the current admin, it's a user. 
                    // If recipient is NOT the current admin (and not null), it's a user we talked to.
                    // Simplified: Collect all IDs that are NOT the current admin.
                    if (msg.sender_id !== adminUser?.id) userIds.add(msg.sender_id)
                    if (msg.recipient_id && msg.recipient_id !== adminUser?.id) userIds.add(msg.recipient_id)

                    // Track latest message for preview
                    const otherId = msg.sender_id === adminUser?.id ? msg.recipient_id : msg.sender_id
                    if (otherId && !latestMessages.has(otherId)) {
                        latestMessages.set(otherId, msg)
                    }
                })

                if (userIds.size > 0) {
                    const { data: profiles, error: profileError } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .in('id', Array.from(userIds))

                    if (profileError) console.error("[AdminSupportPage] Profile fetch error:", profileError)

                    if (profiles) {
                        const chats: ChatUser[] = profiles.map(p => ({
                            ...p,
                            last_message: latestMessages.get(p.id),
                            // unread_count: ... // TODO: Calculate unread
                        })).sort((a, b) => {
                            const dateA = new Date(a.last_message?.created_at || 0).getTime()
                            const dateB = new Date(b.last_message?.created_at || 0).getTime()
                            return dateB - dateA
                        })
                        setActiveUsers(chats)
                    }
                }
            }
            setIsLoadingUsers(false)
        }

        fetchActiveUsers()

        // Realtime subscription for new users/messages would go here
        const channel = supabase
            .channel('admin-support-list')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
                fetchActiveUsers() // Refresh list on new message
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [adminUser])

    // 2. Fetch Messages for Selected User
    React.useEffect(() => {
        if (!selectedUserId) return

        const fetchMessages = async () => {
            setIsLoadingMessages(true)
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${selectedUserId},recipient_id.eq.${adminUser?.id}),and(sender_id.eq.${adminUser?.id},recipient_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},recipient_id.is.null)`)
                // Note: The OR logic handles: User->Admin, Admin->User, User->Global(Null)
                // Ideally, support chat should be 1:1, so we look for interactions involving this user.
                // Simplified for this context: Get all messages where specific User is Sender OR Recipient
                .or(`sender_id.eq.${selectedUserId},recipient_id.eq.${selectedUserId}`)
                .order('created_at', { ascending: true })

            if (data) setMessages(data)
            setIsLoadingMessages(false)
            scrollToBottom()
        }

        fetchMessages()

        const channel = supabase
            .channel(`chat:${selectedUserId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${selectedUserId}` // Listen for user messages
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message])
                scrollToBottom()
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${selectedUserId}` // Listen for our replies (if multi-admin)
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message])
                scrollToBottom()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [selectedUserId, adminUser])

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
        }, 100)
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedUserId || !adminUser) return

        const content = newMessage.trim()
        setNewMessage("")

        // Optimistic
        const tempMsg: Message = {
            id: Math.random().toString(),
            content,
            sender_id: adminUser.id,
            recipient_id: selectedUserId,
            created_at: new Date().toISOString(),
            is_read: false
        }
        setMessages(prev => [...prev, tempMsg])
        scrollToBottom()

        const { error } = await supabase.from('messages').insert({
            content,
            sender_id: adminUser.id,
            recipient_id: selectedUserId // Direct message
        })

        if (error) console.error("Send error:", error)
    }

    return (
        <div className="flex-1 flex overflow-hidden bg-slate-50">
            {/* Sidebar - User List */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-bold text-lg text-slate-800 mb-4">Live Support</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search users..." className="pl-9 h-10 bg-slate-50 border-slate-200" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoadingUsers ? (
                        <div className="p-4 text-center text-slate-400 text-sm">Loading chats...</div>
                    ) : activeUsers.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No active conversations</p>
                        </div>
                    ) : (
                        activeUsers.map(chatUser => (
                            <button
                                key={chatUser.id}
                                onClick={() => setSelectedUserId(chatUser.id)}
                                className={cn(
                                    "w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50",
                                    selectedUserId === chatUser.id && "bg-blue-50/50 border-blue-100"
                                )}
                            >
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={cn("font-medium text-sm truncate", selectedUserId === chatUser.id ? "text-primary-blue" : "text-slate-900")}>
                                            {chatUser.full_name || chatUser.email}
                                        </span>
                                        {chatUser.last_message && (
                                            <span className="text-[10px] text-slate-400 shrink-0">
                                                {format(new Date(chatUser.last_message.created_at), 'MMM d, HH:mm')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {chatUser.last_message?.content || "No messages yet"}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/50">
                {selectedUserId ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">
                                        {activeUsers.find(u => u.id === selectedUserId)?.full_name || activeUsers.find(u => u.id === selectedUserId)?.email}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-xs text-slate-500">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {isLoadingMessages && messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading conversation...</div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender_id === adminUser?.id
                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={msg.id}
                                            className={cn("flex flex-col max-w-[70%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
                                        >
                                            <div className={cn(
                                                "px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                                isMe
                                                    ? "bg-primary-blue text-white rounded-br-sm"
                                                    : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                                            )}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1.5 px-1">
                                                {format(new Date(msg.created_at), 'MMM d, HH:mm')}
                                            </span>
                                        </motion.div>
                                    )
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a reply..."
                                    className="flex-1 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all shadow-inner"
                                />
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="h-12 w-12 rounded-xl bg-primary-blue hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="h-10 w-10 opacity-30" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-600 mb-2">Select a Conversation</h3>
                        <p className="max-w-xs text-center text-sm">Choose a user from the sidebar to start chatting or view their message history.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function AdminSupportPage() {
    return (
        <React.Suspense fallback={<div className="flex-1 flex items-center justify-center bg-slate-50"><div className="h-8 w-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" /></div>}>
            <SupportContent />
        </React.Suspense>
    )
}
