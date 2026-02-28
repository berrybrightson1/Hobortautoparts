"use client"

import * as React from "react"
import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

interface LiveSupportTriggerProps {
    href: string
    isActive: boolean
    onClick?: () => void
    collapsed?: boolean
}

export function LiveSupportTrigger({ href, isActive, onClick, collapsed = false }: LiveSupportTriggerProps) {
    const { user: adminUser } = useAuth()
    const [hasUnread, setHasUnread] = React.useState(false)

    React.useEffect(() => {
        if (!adminUser) return

        const fetchRecentChatters = async () => {
            const { data: messages } = await supabase
                .from('messages')
                .select('sender_id, is_read')
                .neq('sender_id', adminUser.id)
                .order('created_at', { ascending: false })
                .limit(50)

            if (messages && messages.length > 0) {
                setHasUnread(messages.some(m => !m.is_read))
            }
        }

        fetchRecentChatters()

        const channel = supabase
            .channel('sidebar-live-support')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                if (payload.new.sender_id !== adminUser.id) fetchRecentChatters()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [adminUser])

    if (collapsed) {
        return (
            <Link
                href={href}
                onClick={onClick}
                title="Live Support"
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl mx-auto transition-all duration-200 group relative",
                    isActive
                        ? "bg-primary-blue text-white shadow-md"
                        : "text-slate-400 hover:bg-slate-100 hover:text-primary-blue"
                )}
            >
                <MessageSquare className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                )}
            </Link>
        )
    }

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                isActive
                    ? "bg-primary-blue text-white shadow-lg shadow-primary-blue/30"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
        >
            <div className="relative">
                <MessageSquare className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400")} />
                {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                )}
            </div>
            <span className="text-sm font-medium flex-1">Live Support</span>
        </Link>
    )
}
