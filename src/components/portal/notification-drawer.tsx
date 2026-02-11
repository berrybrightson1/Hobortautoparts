"use client"

import { usePortalStore } from "@/lib/store"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Bell, Check, Trash2, Package, Info, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState, useEffect } from "react"

export function NotificationDrawer() {
    const { notifications, clearNotifications } = usePortalStore()
    const [search, setSearch] = useState('')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const filteredNotifications = notifications.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase())
    )

    const unreadCount = notifications.filter(n => !n.read).length

    if (!mounted) {
        return (
            <button
                className="relative p-2.5 hover:bg-slate-100 rounded-2xl text-slate-500 hover:text-primary-blue transition-all duration-300"
                aria-label="Toggle Notifications"
            >
                <Bell className="h-5 w-5" />
            </button>
        )
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button
                    className="relative p-2.5 hover:bg-slate-100 rounded-2xl text-slate-500 hover:text-primary-blue transition-all duration-300 group"
                    aria-label="Toggle Notifications"
                >
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary-orange ring-2 ring-white shadow-[0_0_10px_rgba(249,115,22,0.4)] animate-pulse" />
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[480px] flex flex-col gap-0 p-0 border-l border-slate-100 shadow-2xl bg-white rounded-l-[3rem]">
                <SheetHeader className="px-8 py-8 border-b border-slate-50 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <SheetTitle className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                                Activities
                                {unreadCount > 0 && (
                                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">
                                        {unreadCount} NEW
                                    </span>
                                )}
                            </SheetTitle>
                            <SheetDescription className="text-xs font-medium text-slate-400">Manage your latest sourcing and tracking updates.</SheetDescription>
                        </div>
                        {notifications.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearNotifications}
                                className="h-9 px-4 rounded-full border-slate-100 text-[10px] font-semibold uppercase tracking-widest hover:bg-primary-blue hover:text-white hover:border-primary-blue transition-all"
                            >
                                <Check className="mr-1.5 h-3 w-3" /> Clear All
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="px-8 py-4 bg-slate-50/50">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                        <Input
                            placeholder="Find an update..."
                            className="pl-11 h-12 bg-white border-slate-100 text-sm font-medium focus-visible:ring-primary-blue/10 transition-all rounded-2xl shadow-sm placeholder:text-slate-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
                    {filteredNotifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                            <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100 relative group">
                                <Bell className="h-10 w-10 text-slate-200 group-hover:rotate-12 transition-transform duration-500" />
                                <div className="absolute -top-2 -right-2 h-6 w-6 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center">
                                    <Check className="h-3 w-3 text-emerald-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-slate-900">All caught up!</p>
                                <p className="text-xs font-medium text-slate-400 max-w-[200px]">You have no unread notifications or active tasks right now.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-6 flex gap-5 rounded-[2rem] transition-all duration-500 border relative overflow-hidden group hover:scale-[1.02] cursor-default",
                                        !notification.read
                                            ? "bg-gradient-to-br from-blue-50/50 to-white border-blue-100 shadow-lg shadow-blue-500/5"
                                            : "bg-white border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-sm border border-white relative z-10",
                                        notification.type === 'order' ? "bg-primary-orange text-white shadow-orange-500/20" :
                                            notification.type === 'promo' ? "bg-blue-600 text-white shadow-blue-500/20" :
                                                "bg-slate-900 text-white shadow-slate-900/20"
                                    )}>
                                        {notification.type === 'order' && <Package className="h-6 w-6" />}
                                        {notification.type === 'promo' && <Tag className="h-6 w-6" />}
                                        {notification.type === 'system' && <Info className="h-6 w-6" />}
                                    </div>
                                    <div className="flex-1 space-y-1 relative z-10">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn("text-sm font-semibold transition-colors", notification.read ? "text-slate-900" : "text-primary-blue")}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest tabular-nums mt-1">{notification.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed pr-4">
                                            {notification.message}
                                        </p>
                                    </div>

                                    {!notification.read && (
                                        <div className="absolute right-0 top-0 h-full w-1.5 bg-brand-orange shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-8 bg-white border-t border-slate-50">
                    <div className="p-6 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10">
                            <p className="text-[10px] font-semibold text-primary-orange uppercase tracking-widest mb-1">Status Report</p>
                            <p className="text-sm font-semibold">Platform Status: Optimal</p>
                            <p className="text-[10px] opacity-60 mt-1 font-medium">Auto-cleanup enabled for 24h old logs.</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
