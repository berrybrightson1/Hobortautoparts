"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, Trash2, Package, Info, Tag, Clock, CheckCheck, PackageSearch, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn, formatMinimalDistance } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { InteractiveNotification } from "@/components/portal/interactive-notification"

interface Notification {
    id: string
    title: string
    message: string
    type: 'order' | 'promo' | 'system' | 'request'
    link: string | null
    read: boolean
    created_at: string
}

export function NotificationPopover() {
    const { user } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [activeInteractive, setActiveInteractive] = useState<Notification | null>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!user) return

        // Initial fetch
        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (!error && data) {
                setNotifications(data as Notification[])
            }
            setIsLoading(false)
        }

        fetchNotifications()

        // Real-time subscription
        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                const newNotif = payload.new as Notification
                setNotifications(prev => [newNotif, ...prev])
                // Clear any existing one first to trigger re-animation if needed
                setActiveInteractive(null)
                setTimeout(() => setActiveInteractive(newNotif), 10)
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    const markAllAsRead = async () => {
        if (!user) return
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            toast.success("All notifications marked as read")
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

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="relative" ref={popoverRef}>
            <button
                className={cn(
                    "relative p-2.5 rounded-xl transition-all group",
                    isOpen ? "bg-blue-50 text-primary-blue shadow-inner" : "hover:bg-slate-100 text-slate-500 hover:text-primary-blue"
                )}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Notifications"
            >
                <Bell className={cn("h-5 w-5 transition-transform", isOpen ? "scale-110" : "group-hover:scale-110")} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary-orange ring-2 ring-white animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-4 w-[420px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[100]"
                    >
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Updates</h3>
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary-blue animate-pulse" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                                        {unreadCount} UNREAD
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-primary-blue hover:text-blue-700 hover:bg-blue-50 rounded-full"
                                    >
                                        <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                                        Clear All
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="max-h-[450px]">
                            {notifications.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 px-12">
                                    <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100/50 shadow-inner">
                                        <Bell className="h-10 w-10 text-slate-200" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900">Quiet for now</p>
                                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                            We'll let you know when there's an update on your requests.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => {
                                                if (!notification.read) markAsRead(notification.id);
                                                if (notification.link) {
                                                    router.push(notification.link)
                                                }
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "p-4 rounded-2xl transition-all duration-300 flex gap-4 cursor-pointer group hover:bg-slate-50 border border-transparent",
                                                !notification.read ? "bg-blue-50/20 border-blue-50/50" : "bg-transparent"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white shadow-md transition-transform group-hover:scale-110",
                                                notification.type === 'order' ? "bg-orange-100 text-orange-600" :
                                                    notification.type === 'promo' ? "bg-blue-100 text-blue-600" :
                                                        notification.type === 'request' ? "bg-emerald-100 text-emerald-600" :
                                                            "bg-slate-100 text-slate-600"
                                            )}>
                                                {notification.type === 'order' && <Package className="h-5 w-5" />}
                                                {notification.type === 'promo' && <Tag className="h-5 w-5" />}
                                                {notification.type === 'request' && <PackageSearch className="h-5 w-5" />}
                                                {notification.type === 'system' && <Info className="h-5 w-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <p className={cn("text-sm font-bold truncate", notification.read ? "text-slate-600" : "text-slate-900")}>
                                                            {notification.title}
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                                        {formatMinimalDistance(notification.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 pr-4">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="h-2 w-2 rounded-full bg-primary-blue mt-2 shrink-0 animate-pulse" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                            <Button
                                variant="outline"
                                className="w-full rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 h-11 hover:bg-white hover:border-slate-300 transition-all shadow-sm active:scale-95"
                            >
                                Inbox History
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
