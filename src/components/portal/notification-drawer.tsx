"use client"

import { useState, useEffect } from "react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Bell, Check, Trash2, Package, Info, Tag, Clock, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface Notification {
    id: string
    title: string
    message: string
    type: 'order' | 'promo' | 'system'
    read: boolean
    created_at: string
}

export function NotificationDrawer() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

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
            .channel('public:notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev])
                toast.info(payload.new.title, {
                    description: payload.new.message
                })
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
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button
                    className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-primary-blue transition-all group"
                    aria-label="Toggle Notifications"
                >
                    <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-orange ring-2 ring-white" />
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="w-[380px] sm:w-[440px] p-0 flex flex-col border-l border-slate-100 bg-white shadow-2xl overflow-hidden rounded-l-[2rem]">
                <SheetHeader className="p-6 border-b border-slate-50 flex items-center justify-between flex-row space-y-0">
                    <div className="space-y-1">
                        <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">Notifications</SheetTitle>
                        <SheetDescription className="text-xs font-medium text-slate-400">
                            {unreadCount} unread updates
                        </SheetDescription>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-primary-blue hover:text-blue-700 hover:bg-blue-50 rounded-full"
                        >
                            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                            Mark all read
                        </Button>
                    )}
                </SheetHeader>

                <ScrollArea className="flex-1 px-2 py-4">
                    {notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100/50">
                                <Bell className="h-8 w-8 text-slate-200" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-900">No notifications yet</p>
                                <p className="text-xs text-slate-400 font-medium max-w-[180px]">Your activity updates will appear here.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                    className={cn(
                                        "p-4 mx-2 rounded-2xl transition-all duration-300 flex gap-4 cursor-pointer group hover:bg-slate-50 relative",
                                        !notification.read ? "bg-blue-50/30" : "bg-transparent"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-white shadow-sm",
                                        notification.type === 'order' ? "bg-orange-100 text-orange-600" :
                                            notification.type === 'promo' ? "bg-blue-100 text-blue-600" :
                                                "bg-slate-100 text-slate-600"
                                    )}>
                                        {notification.type === 'order' && <Package className="h-5 w-5" />}
                                        {notification.type === 'promo' && <Tag className="h-5 w-5" />}
                                        {notification.type === 'system' && <Info className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn("text-xs font-bold truncate", notification.read ? "text-slate-600" : "text-slate-900")}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                    <Button
                        variant="outline"
                        className="w-full rounded-xl border-slate-200 text-xs font-bold text-slate-600 h-10 hover:bg-white hover:border-slate-300 transition-all"
                    >
                        View All Activity
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
    )
}
