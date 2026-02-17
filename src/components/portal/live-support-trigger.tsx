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
}

export function LiveSupportTrigger({ href, isActive, onClick }: LiveSupportTriggerProps) {
    const { user: adminUser } = useAuth()
    const [recentAvatars, setRecentAvatars] = React.useState<string[]>([])
    const [hasUnread, setHasUnread] = React.useState(false)

    React.useEffect(() => {
        if (!adminUser) return

        const fetchRecentChatters = async () => {
            // Fetch distinct senders who are not me (admin)
            // Limit to last 3 for the stack
            const { data: messages } = await supabase
                .from('messages')
                .select('sender_id, created_at, is_read')
                .neq('sender_id', adminUser.id) // Messages sent BY users
                .order('created_at', { ascending: false })
                .limit(50) // Look at last 50 messages to find unique users

            if (messages && messages.length > 0) {
                const uniqueSenders = new Set<string>()
                const sendersToFetch: string[] = []
                let unreadFound = false



                for (const msg of messages) {
                    if (!uniqueSenders.has(msg.sender_id)) {
                        uniqueSenders.add(msg.sender_id)
                        sendersToFetch.push(msg.sender_id)
                    }
                    if (!msg.is_read) unreadFound = true
                    if (uniqueSenders.size >= 3) break
                }


                setHasUnread(unreadFound)

                if (sendersToFetch.length > 0) {
                    const { data: profiles, error: profileError } = await supabase
                        .from('profiles')
                        .select('avatar_url')
                        .in('id', sendersToFetch)

                    if (profileError) console.error("[LiveSupportTrigger] Profile fetch error:", profileError)


                    if (profiles) {
                        setRecentAvatars(profiles.map(p => p.avatar_url).filter(Boolean) as string[])
                    }
                }
            }
        }

        fetchRecentChatters()

        // Subscribe to NEW messages to update the badge/stack
        const channel = supabase
            .channel('sidebar-live-support')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                if (payload.new.sender_id !== adminUser.id) {
                    fetchRecentChatters()
                }
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [adminUser])

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                isActive
                    ? "bg-gradient-to-r from-primary-blue to-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
        >
            <div className="relative">
                <MessageSquare className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400")} />
                {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                )}
            </div>
            <span className="text-sm font-semibold flex-1">Live Support</span>

            {/* Optional: Add a simple count if we wanted, but dot is cleaner for now */}
        </Link>
    )
}
