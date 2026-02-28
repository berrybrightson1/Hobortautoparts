"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCheck, Package, Info, Tag, PackageSearch, ArrowLeft, Trash2, Search, Filter, MoreHorizontal, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

const formatNotificationDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5

    if (diffHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true })
    } else {
        const diffDays = Math.floor(diffHours / 24)
        const timeStr = format(date, 'h:mm a')
        return `${diffDays} Day${diffDays === 1 ? '' : 's'} at ${timeStr}`
    }
}

interface Notification {
    id: string
    title: string
    message: string
    type: 'order' | 'promo' | 'system' | 'request'
    link: string | null
    read: boolean
    created_at: string
}

export function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Real-time subscription could also be set up here if desired, 
    // but the layout popover already handles global real-time pinging.
    // For a history page, a manual refresh or listening is fine.
    // To ensure consistency, we'll just listen to changes too.
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const channel = supabase
                .channel(`notifications_page:${user.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev])
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n))
                })
                .on('postgres_changes', {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
        fetchUserData()
    }, [])

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            toast.success("All notifications marked as read")
        } else {
            toast.error("Failed to mark notifications as read")
        }
    }

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        }
    }

    const markAsUnread = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: false })
            .eq('id', id)

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n))
        }
    }

    const deleteNotification = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation() // Prevent row click

        toast("Are you sure you want to delete this notification?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    const { error } = await supabase
                        .from('notifications')
                        .delete()
                        .eq('id', id)

                    if (!error) {
                        setNotifications(prev => prev.filter(n => n.id !== id))
                        toast.success("Notification deleted")
                    } else {
                        toast.error("Failed to delete notification")
                    }
                }
            },
            cancel: {
                label: "Cancel",
                onClick: () => { }
            }
        })
    }

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'unread' && n.read) return false
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase()
            return n.title.toLowerCase().includes(lowerQ) || n.message.toLowerCase().includes(lowerQ)
        }
        return true
    })

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        className="mb-2 -ml-3 text-slate-500 hover:text-slate-900 h-8"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight text-slate-900">
                        Inbox History
                        {unreadCount > 0 && (
                            <span className="bg-primary-orange text-white text-sm py-0.5 px-2.5 rounded-full font-bold">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Your complete history of alerts, updates, and messages.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <Button
                            onClick={markAllAsRead}
                            variant="outline"
                            className="bg-white border-slate-200 text-slate-700 hover:text-primary-blue hover:border-primary-blue hover:bg-blue-50 h-[40px] px-4 font-bold text-xs tracking-widest uppercase transition-all"
                        >
                            <CheckCheck className="h-4 w-4 mr-2" /> Mark All Read
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sticky top-4 z-10">
                <div className="flex p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "flex-1 sm:w-32 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                            activeTab === 'all'
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('unread')}
                        className={cn(
                            "flex-1 sm:w-32 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                            activeTab === 'unread'
                                ? "bg-white text-primary-orange shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        Unread
                    </button>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-[40px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                {filteredNotifications.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center text-center px-4">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100 p-6">
                            <Bell className="h-full w-full text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {searchQuery ? "No matching updates found" : activeTab === 'unread' ? "You're all caught up!" : "Your inbox is empty"}
                        </h3>
                        <p className="text-slate-500 max-w-sm">
                            {searchQuery
                                ? "Try adjusting your search to find what you're looking for."
                                : "We'll deliver important updates about your sourcing requests, orders, and account status right here."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-slate-100">
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.map((notif) => (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    onClick={() => {
                                        if (!notif.read) markAsRead(notif.id)
                                        if (notif.link) router.push(notif.link)
                                    }}
                                    className={cn(
                                        "group p-4 sm:p-6 transition-all hover:bg-slate-50 cursor-pointer relative",
                                        !notif.read ? "bg-blue-50/10" : "bg-white"
                                    )}
                                >
                                    <div className="flex items-start gap-4 sm:gap-6">
                                        <div className={cn(
                                            "h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center shrink-0 border-4 border-white shadow-md transition-transform group-hover:scale-105",
                                            notif.type === 'order' ? "bg-orange-100 text-orange-600" :
                                                notif.type === 'promo' ? "bg-blue-100 text-blue-600" :
                                                    notif.type === 'request' ? "bg-emerald-100 text-emerald-600" :
                                                        "bg-slate-100 text-slate-600"
                                        )}>
                                            {notif.type === 'order' && <Package className="h-6 w-6 sm:h-7 sm:w-7" />}
                                            {notif.type === 'promo' && <Tag className="h-6 w-6 sm:h-7 sm:w-7" />}
                                            {notif.type === 'request' && <PackageSearch className="h-6 w-6 sm:h-7 sm:w-7" />}
                                            {notif.type === 'system' && <Info className="h-6 w-6 sm:h-7 sm:w-7" />}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-10">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                                                <h3 className={cn(
                                                    "text-base sm:text-lg font-bold truncate",
                                                    notif.read ? "text-slate-700" : "text-slate-900"
                                                )}>
                                                    {notif.title}
                                                </h3>
                                                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
                                                    {formatNotificationDate(notif.created_at)}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-sm sm:text-base leading-relaxed",
                                                notif.read ? "text-slate-500" : "text-slate-700 font-medium"
                                            )}>
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons Overlay */}
                                    <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    onClick={(e) => e.stopPropagation()}
                                                    aria-label="More actions"
                                                    className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                {!notif.read ? (
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation()
                                                        markAsRead(notif.id)
                                                    }}>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Mark as read
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation()
                                                        markAsUnread(notif.id)
                                                    }}>
                                                        <Bell className="h-4 w-4 mr-2" />
                                                        Mark as unread
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={(e) => deleteNotification(e, notif.id)}
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Unread dot indicator on mobile when not hovering */}
                                    {!notif.read && (
                                        <div className="absolute top-4 right-4 sm:right-6 h-3 w-3 bg-primary-blue rounded-full group-hover:opacity-0 transition-opacity" />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}
