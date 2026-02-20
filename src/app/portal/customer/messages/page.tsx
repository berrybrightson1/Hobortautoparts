"use client"

import * as React from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useChat } from "@/components/chat/use-chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Loader2, MessageSquare, Send, Search, Package, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"
import { RequestChat } from "@/components/chat/request-chat"

export default function MessagesPage() {
    const { user, profile } = useAuth()
    const [activeTab, setActiveTab] = React.useState<"general" | string>("general")
    const [requests, setRequests] = React.useState<any[]>([])
    const [isLoadingRequests, setIsLoadingRequests] = React.useState(true)

    // General Chat Hook
    const { messages, sendMessage, isLoading: isChatLoading, scrollRef } = useChat(user, false, null, activeTab === "general")
    const [newMessage, setNewMessage] = React.useState("")

    React.useEffect(() => {
        if (user) {
            fetchRequests()
        }
    }, [user])

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('sourcing_requests')
                .select('id, part_name, created_at, status, vehicle_info')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setRequests(data || [])
        } catch (error) {
            console.error("Error fetching requests:", error)
        } finally {
            setIsLoadingRequests(false)
        }
    }

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (newMessage.trim()) {
            sendMessage(newMessage)
            setNewMessage("")
        }
    }

    if (!user) return null

    return (
        <div className="flex-1 flex bg-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 bg-white border-slate-200 rounded-xl h-9 text-sm focus:ring-primary-blue/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {/* General Support Item */}
                    <button
                        onClick={() => setActiveTab("general")}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                            activeTab === "general"
                                ? "bg-white shadow-sm ring-1 ring-slate-100"
                                : "hover:bg-slate-100/50"
                        )}
                    >
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                            activeTab === "general" ? "bg-blue-100 text-primary-blue" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-primary-blue"
                        )}>
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className={cn("font-medium text-sm truncate", activeTab === "general" ? "text-slate-900" : "text-slate-700")}>General Support</span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">Contact admin support</p>
                        </div>
                        {activeTab === "general" && <ChevronRight className="h-4 w-4 text-slate-300" />}
                    </button>

                    <div className="px-3 pt-4 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sourcing Requests</span>
                    </div>

                    {/* Request Items */}
                    {isLoadingRequests ? (
                        <div className="px-4 py-8 flex justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-xs text-slate-400">No requests found</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <button
                                key={req.id}
                                onClick={() => setActiveTab(req.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                                    activeTab === req.id
                                        ? "bg-white shadow-sm ring-1 ring-slate-100"
                                        : "hover:bg-slate-100/50"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                                    activeTab === req.id ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-purple-600"
                                )}>
                                    <Package className="h-5 w-5" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={cn("font-medium text-sm truncate", activeTab === req.id ? "text-slate-900" : "text-slate-700")}>
                                            {req.part_name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 shrink-0">
                                            {format(new Date(req.created_at), 'MMM d')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 truncate">{req.vehicle_info || 'No vehicle info'}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {activeTab === "general" ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">Support Chat</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <p className="text-xs text-slate-500">Online</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth"
                        >
                            {isChatLoading && messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                    <p className="text-sm">Loading history...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                    <MessageSquare className="h-12 w-12 opacity-20" />
                                    <p className="text-sm">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender_id === user.id
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex flex-col max-w-[80%] lg:max-w-[60%]",
                                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                                                isMe
                                                    ? "bg-primary-blue text-white rounded-br-sm"
                                                    : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                                            )}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1.5 px-2 font-medium">
                                                {format(new Date(msg.created_at), 'h:mm a')}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary-blue/20 transition-all pl-4"
                                />
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="h-12 w-12 rounded-2xl bg-primary-blue hover:bg-blue-700 shrink-0 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    // Request Chat View
                    <RequestChat
                        requestId={activeTab}
                        requestTitle={requests.find(r => r.id === activeTab)?.part_name || 'Request Chat'}
                        currentUserId={user.id}
                        isAgent={profile?.role === 'agent'}
                    />
                )}
            </div>
        </div>
    )
}
