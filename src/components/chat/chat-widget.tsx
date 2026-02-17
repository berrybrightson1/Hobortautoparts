"use client"

import * as React from "react"
import { MessageSquare, Send, X, Loader2, Minus, ArrowLeft, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useChat, Message } from "@/components/chat/use-chat"

interface ChatUser {
    id: string
    full_name: string | null
    avatar_url?: string
    email?: string
    last_message?: Message
}

export function ChatWidget() {
    const { user, profile } = useAuth()
    const [isOpen, setIsOpen] = React.useState(false)
    const [isMinimized, setIsMinimized] = React.useState(false)

    // Admin State
    const isAdmin = profile?.role === 'admin'
    const [view, setView] = React.useState<'list' | 'chat'>('list')
    const [activeUsers, setActiveUsers] = React.useState<ChatUser[]>([])
    const [selectedUser, setSelectedUser] = React.useState<ChatUser | null>(null)
    const [recentAvatars, setRecentAvatars] = React.useState<string[]>([])

    // Shared State via Hook
    const [newMessage, setNewMessage] = React.useState("")
    const {
        messages,
        sendMessage,
        isLoading,
        scrollRef,
        remoteIsTyping,
        setLocalTyping
    } = useChat(
        user,
        isAdmin,
        selectedUser,
        isOpen
    )

    // Calculate unread status (if any active user has a last message NOT from me)
    const hasUnread = React.useMemo(() => {
        if (!isAdmin) return false // Customers just see the chat open/close
        return activeUsers.some(u => u.last_message && u.last_message.sender_id !== user?.id)
    }, [activeUsers, isAdmin, user])

    // Reset view when closing
    React.useEffect(() => {
        if (!isOpen) {
            // Optional: reset to list if admin?
            // if (isAdmin) setView('list') 
        }
    }, [isOpen, isAdmin])

    // --- ADMIN: Fetch User List for Inbox ---
    React.useEffect(() => {
        if (!isAdmin || !user) return

        const fetchActiveUsers = async () => {
            // Similar logic to AdminSupportPage
            const { data: messagesData } = await supabase
                .from('messages')
                .select('sender_id, recipient_id, content, created_at')
                .order('created_at', { ascending: false })
                .limit(100)

            if (messagesData) {
                const userIds = new Set<string>()
                const latestMessages = new Map<string, Message>()

                messagesData.forEach((msg: any) => {
                    if (msg.sender_id !== user.id) userIds.add(msg.sender_id)
                    if (msg.recipient_id && msg.recipient_id !== user.id) userIds.add(msg.recipient_id)

                    const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
                    if (otherId && !latestMessages.has(otherId)) {
                        latestMessages.set(otherId, msg)
                    }
                })

                if (userIds.size > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url, email')
                        .in('id', Array.from(userIds))

                    if (profiles) {
                        const chats: ChatUser[] = profiles.map(p => ({
                            ...p,
                            last_message: latestMessages.get(p.id)
                        })).sort((a, b) => {
                            const dateA = new Date(a.last_message?.created_at || 0).getTime()
                            const dateB = new Date(b.last_message?.created_at || 0).getTime()
                            return dateB - dateA
                        })
                        setActiveUsers(chats)
                        // Only show avatars if they are real and not just placeholders
                        setRecentAvatars(chats.slice(0, 3).map(c => c.avatar_url).filter(Boolean) as string[])
                    }
                } else {
                    setActiveUsers([])
                    setRecentAvatars([])
                }
            }
        }

        fetchActiveUsers()

        // Poll for new users occasionally
        const interval = setInterval(fetchActiveUsers, 10000)

        // Realtime Subscription for INBOX (New messages from anyone)
        const channel = supabase
            .channel('admin-inbox-updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, () => {
                fetchActiveUsers()
            })
            .subscribe()

        return () => {
            clearInterval(interval)
            supabase.removeChannel(channel)
        }
    }, [isAdmin, user])

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!newMessage.trim() || !user) return

        await sendMessage(newMessage)
        setNewMessage("")
    }

    if (!user) return null

    // -- RENDER HELPERS --

    const TriggerButton = () => {
        if (isAdmin) {
            // Only show the administrative "Messages" pill if there are active users/chats to manage
            if (activeUsers.length === 0) return null

            return (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform z-[50] group"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <span className="font-bold text-sm">Messages</span>
                    </div>

                    {/* Avatar Stack */}
                    {recentAvatars.length > 0 && (
                        <div className="flex items-center pl-2 border-l border-white/20 ml-1">
                            <div className="flex -space-x-2">
                                {recentAvatars.map((url, i) => (
                                    <div key={i} className="relative">
                                        <img
                                            src={url}
                                            alt="User"
                                            className="h-6 w-6 rounded-full border-2 border-slate-900 object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            {hasUnread && (
                                <div className="ml-2 h-2.5 w-2.5 bg-red-500 rounded-full border border-slate-900 animate-pulse" />
                            )}
                        </div>
                    )}
                </motion.button>
            )
        }

        // Customer Logic
        return (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="fixed bottom-6 right-6 h-14 w-14 bg-primary-blue text-white rounded-full shadow-xl shadow-blue-900/20 flex items-center justify-center hover:scale-110 transition-transform z-[50]"
                onClick={() => setIsOpen(true)}
                aria-label="Open support chat"
            >
                <MessageSquare className="h-6 w-6" />
            </motion.button>
        )
    }

    return (
        <React.Fragment>
            {!isOpen && <TriggerButton />}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? 'auto' : '500px'
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={cn(
                            "fixed bottom-6 right-6 w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[50] flex flex-col",
                            isMinimized ? "h-auto" : "h-[500px]"
                        )}
                    >
                        {/* Header */}
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                {isAdmin && view === 'chat' && (
                                    <button
                                        onClick={() => setView('list')}
                                        className="hover:bg-white/10 p-1 rounded-full mr-1"
                                        aria-label="Back to active chats"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                )}
                                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="font-bold text-sm tracking-wide">
                                    {isAdmin ? (view === 'list' ? 'Active Chats' : selectedUser?.full_name || 'Chat') : 'Live Support'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    aria-label="Close chat"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <React.Fragment>
                                {/* CONTENT AREA */}
                                {isAdmin && view === 'list' ? (
                                    // ADMIN INBOX VIEW
                                    <div className="flex-1 overflow-y-auto bg-slate-50">
                                        {activeUsers.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400">
                                                <p className="text-xs">No active conversations</p>
                                            </div>
                                        ) : (
                                            activeUsers.map(chatUser => (
                                                <button
                                                    key={chatUser.id}
                                                    onClick={() => {
                                                        setSelectedUser(chatUser)
                                                        setView('chat')
                                                    }}
                                                    className="w-full p-4 flex items-center gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left"
                                                >
                                                    {chatUser.avatar_url ? (
                                                        <img
                                                            src={chatUser.avatar_url}
                                                            alt={`${chatUser.full_name}'s avatar`}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-slate-500" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-800 text-sm truncate">{chatUser.full_name || chatUser.email}</p>
                                                        <p className="text-xs text-slate-500 truncate">{chatUser.last_message?.content || 'No messages'}</p>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                        {chatUser.last_message && format(new Date(chatUser.last_message.created_at), 'HH:mm')}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    // CHAT VIEW (Admin & Customer)
                                    <>
                                        <div
                                            ref={scrollRef}
                                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth"
                                        >
                                            {isLoading && messages.length === 0 ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                                </div>
                                            ) : (
                                                <>
                                                    {messages.map((msg) => {
                                                        const isMe = msg.sender_id === user.id
                                                        return (
                                                            <div
                                                                key={msg.id}
                                                                className={cn(
                                                                    "flex flex-col max-w-[85%]",
                                                                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "p-3 rounded-2xl text-xs font-medium leading-relaxed",
                                                                    isMe
                                                                        ? "bg-primary-blue text-white rounded-br-none"
                                                                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm"
                                                                )}>
                                                                    {msg.content}
                                                                </div>
                                                                <span className="text-[9px] text-slate-400 mt-1 px-1">
                                                                    {format(new Date(msg.created_at), 'HH:mm')}
                                                                </span>
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
                                                            <span>Typing...</span>
                                                        </motion.div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Input Area */}
                                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                                            <Input
                                                value={newMessage}
                                                onChange={(e) => {
                                                    setNewMessage(e.target.value)
                                                    setLocalTyping(true)
                                                }}
                                                placeholder="Type message..."
                                                className="rounded-xl border-slate-200 bg-slate-50 text-xs focus:bg-white h-10"
                                            />
                                            <Button
                                                type="submit"
                                                size="icon"
                                                disabled={!newMessage.trim()}
                                                className="h-10 w-10 rounded-xl bg-primary-blue hover:bg-blue-700 shrink-0 shadow-lg"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </>
                                )}
                            </React.Fragment>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </React.Fragment>
    )
}
