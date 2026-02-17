"use client"

import * as React from "react"
import { MessageSquare, Send, X, Loader2, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Message {
    id: string
    content: string
    sender_id: string
    created_at: string
}

export function ChatWidget() {
    const { user, profile } = useAuth()
    const [isOpen, setIsOpen] = React.useState(false)
    const [isMinimized, setIsMinimized] = React.useState(false)
    const [messages, setMessages] = React.useState<Message[]>([])
    const [newMessage, setNewMessage] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (!user || !isOpen) return

        // Initial fetch
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50)

            if (data) {
                setMessages(prev => {
                    // Avoid duplicates merging logic could go here, but simple replacement is safer for now?
                    // actually, replacing entire list might cause jump.
                    // Let's just set it. 
                    // Better: Merge based on ID
                    const existingIds = new Set(prev.map(m => m.id))
                    const newMessages = data.filter(m => !existingIds.has(m.id))
                    if (newMessages.length === 0) return prev
                    return [...prev, ...newMessages].sort((a, b) =>
                        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    )
                })
            }
            setIsLoading(false)
            if (messages.length === 0) scrollToBottom() // Only scroll on first load
        }

        setIsLoading(true)
        fetchMessages()

        // Real-time subscription
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                console.log("New message received via realtime:", payload)
                const newMsg = payload.new as Message
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev
                    return [...prev, newMsg]
                })
                scrollToBottom()
            })
            .subscribe((status) => {
                console.log("Realtime connection status:", status)
            })

        // Polling fallback (every 5 seconds) to ensure delivery if Realtime fails (common with RLS joins)
        const interval = setInterval(fetchMessages, 5000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(interval)
        }
    }, [user, isOpen]) // removed messages dep to avoid loop, handled inside setMessages

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
        }, 100)
    }

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!newMessage.trim() || !user) return

        const content = newMessage.trim()
        setNewMessage("") // Optimistic clear

        // Optimistic update
        const tempId = Math.random().toString()
        const optimisticMessage: Message = {
            id: tempId,
            content,
            sender_id: user.id,
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, optimisticMessage])
        scrollToBottom()

        const { error } = await supabase.from('messages').insert({
            content,
            sender_id: user.id,
            // recipient_id can be null (broadcast) or specific based on logic
        })

        if (error) {
            console.error("Failed to send message:", error)
            // Revert optimistic update if needed, or show error
        }
    }

    if (!user) return null

    return (
        <React.Fragment>
            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="fixed bottom-6 right-6 h-14 w-14 bg-primary-blue text-white rounded-full shadow-xl shadow-blue-900/20 flex items-center justify-center hover:scale-110 transition-transform z-[50]"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open support chat"
                >
                    <MessageSquare className="h-6 w-6" />
                </motion.button>
            )}

            {/* Chat Window */}
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
                                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="font-bold text-sm tracking-wide">Live Support</span>
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
                                {/* Messages Area */}
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth"
                                >
                                    {isLoading && messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
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
                                        })
                                    )}
                                    {messages.length === 0 && !isLoading && (
                                        <div className="text-center text-xs text-slate-400 mt-10">
                                            <p>Start a conversation with our team.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="rounded-xl border-slate-200 bg-slate-50 text-xs focus:bg-white h-10"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!newMessage.trim()}
                                        className="h-10 w-10 rounded-xl bg-primary-blue hover:bg-blue-700 shrink-0 shadow-lg shadow-blue-900/20"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </React.Fragment>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </React.Fragment>
    )
}
