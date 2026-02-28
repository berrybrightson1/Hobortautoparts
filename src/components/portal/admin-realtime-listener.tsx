"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { ShieldAlert, User, DollarSign, Store, Activity } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

// We can reuse a simplified version of formatDetails from the Audit Logs page 
// to give nice toast descriptions.
function formatNotificationDetails(action: string, details: any) {
    if (!details) return "A system action occurred."

    switch (action) {
        case 'create_order':
            return `New order ${details.orderId ? details.orderId.substring(0, 8) : ''} was created.`
        case 'update_order_status':
            return `Order ${details.orderId ? details.orderId.substring(0, 8) : ''} status changed to ${details.newStatus}.`
        case 'sign_up':
            return `A new ${details.role || 'user'} account was registered.`
        case 'agent_application':
            return `New Agent application submitted for ${details.location}.`
        case 'create_invoice':
            return `Invoice ${details.invoiceId ? details.invoiceId : ''} was generated.`
        case 'update_invoice_status':
            return `Invoice ${details.invoiceId ? details.invoiceId : ''} status changed to ${details.status}.`
        case 'create_sourcing_request':
            return `New RFQ submitted for ${details.partName} (${details.vehicle}).`
        default:
            return `Action performed: ${action.replace(/_/g, ' ')}`
    }
}

// Icon mapper for visual clarity in toasts
function getActionIcon(action: string) {
    if (action.includes('invoice') || action.includes('fee')) return <DollarSign className="h-5 w-5 text-emerald-500" />
    if (action.includes('user') || action.includes('sign_up') || action.includes('agent')) return <User className="h-5 w-5 text-blue-500" />
    if (action.includes('order') || action.includes('request')) return <Store className="h-5 w-5 text-orange-500" />
    return <Activity className="h-5 w-5 text-slate-500" />
}

export function AdminRealtimeListener() {
    const { profile } = useAuth()
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    React.useEffect(() => {
        // Only run this listener if the user is an admin
        if (!isAdmin) return

        console.log("Admin Notification Listener initialized.")

        // Subscribe to INSERT events on the audit_logs table
        const channel = supabase
            .channel('admin-audit-logs')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'audit_logs'
                },
                (payload) => {
                    const log = payload.new

                    // Don't toast for normal user logins to avoid spam, unless desired
                    if (log.action === 'login' || log.action === 'logout') return

                    // Format the action name to look like a title (e.g. "update_invoice" -> "Update Invoice")
                    const title = log.action
                        .split('_')
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')

                    const description = formatNotificationDetails(log.action, log.details)
                    const icon = getActionIcon(log.action)

                    // Fire the Sonner toast
                    toast(title, {
                        description: description,
                        icon: icon,
                        duration: 8000,
                        className: "border-l-4 border-l-primary-orange",
                    })
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to realtime audit logs.')
                }
            })

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel)
        }
    }, [isAdmin])

    // This is a headless component, it doesn't render any UI itself
    return null
}
