"use client"

import * as React from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { InteractiveNotification } from "@/components/portal/interactive-notification"

interface Notification {
    id: string
    title: string
    message: string
    type: 'order' | 'promo' | 'system' | 'request'
    link?: string | null
    read: boolean
    created_at: string
}

export function GlobalNotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [activeNotification, setActiveNotification] = React.useState<Notification | null>(null)

    React.useEffect(() => {
        if (!user) return

        // Global Real-time subscription to notifications table
        const channel = supabase
            .channel(`global-notifications:${user.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                const newNotif = payload.new as Notification
                // Clear any existing one first to trigger re-animation, then set the new one
                setActiveNotification(null)
                setTimeout(() => setActiveNotification(newNotif), 50)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    return (
        <>
            {children}
            <InteractiveNotification
                notification={activeNotification}
                onClose={() => setActiveNotification(null)}
            />
        </>
    )
}
