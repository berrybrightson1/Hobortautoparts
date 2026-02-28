"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { Loader2, ShieldAlert, Search, FileText, Download, Filter, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AuditLog = {
    id: string
    action: string
    details: any
    ip_address: string
    created_at: string
    user_id: string
    profiles: {
        full_name: string
        role: string
    } | null
}

function shortId(id: any) {
    if (typeof id !== 'string') return id;
    // Usually UUIDs are 36 chars long. If it's long, truncate it.
    return id.length > 20 ? id.substring(0, 8) + '...' : id;
}

function formatDetails(action: string, details: any) {
    if (!details) return <span className="text-slate-400 italic">No additional details recorded</span>

    // Exact English sentence breakdowns for known actions
    switch (action) {
        case 'create_order':
            return (
                <span>
                    Created new order <span className="font-mono font-bold" title={details.orderId}>{shortId(details.orderId)}</span>
                    {details.address && ` to be shipped to ${details.address}`}
                </span>
            )
        case 'update_order_status':
            return (
                <span>
                    Changed order <span className="font-mono font-bold" title={details.orderId}>{shortId(details.orderId)}</span> status from{' '}
                    <span className="bg-slate-100 px-1 rounded">{details.oldStatus || 'Previous'}</span> to{' '}
                    <span className="bg-slate-100 px-1 rounded">{details.newStatus}</span>
                </span>
            )
        case 'update_service_fee':
            return (
                <span>
                    Adjusted service fee for order <span className="font-mono font-bold" title={details.orderId}>{shortId(details.orderId)}</span> from{' '}
                    <span className="font-mono">GH₵{details.oldFee || '0'}</span> to{' '}
                    <span className="font-mono">GH₵{details.newFee}</span>
                </span>
            )
        case 'delete_account':
            return (
                <span>
                    Deleted user account <span className="font-mono">{shortId(details.userId)}</span>
                </span>
            )
        case 'login':
            return <span>User successfully logged into the portal</span>
        case 'logout':
            return <span>User securely logged out</span>
        case 'sign_up':
            return <span>Registered a new <span className="capitalize">{details.role || 'user'}</span> account</span>
        case 'agent_application':
            return <span>Submitted application to become an Agent for region: {details.location}</span>
        case 'create_invoice':
            return <span>Created billing invoice <span className="font-mono font-bold">{details.invoiceId}</span> {details.customerName && `for ${details.customerName}`}</span>
        case 'update_invoice_status':
            return <span>Changed invoice <span className="font-mono font-bold">{details.invoiceId}</span> status to <span className="bg-slate-100 px-1 rounded">{details.status}</span></span>
        case 'delete_invoice':
            return <span>Deleted billing invoice <span className="font-mono font-bold">{details.invoiceId}</span></span>
        case 'update_invoice':
            return <span>Updated billing invoice <span className="font-mono font-bold">{details.invoiceId}</span></span>
        case 'create_sourcing_request':
            return <span>Submitted a new sourcing request for <span className="font-bold">{details.partName}</span> ({details.vehicle})</span>
        case 'update_sourcing_request':
            return <span>Updated sourcing request <span className="font-mono font-bold" title={details.requestId}>{shortId(details.requestId)}</span></span>
        case 'admin_delete_user':
            return <span>Administrator permanently deleted user account: <span className="font-mono">{shortId(details.targetUserId)}</span></span>
        case 'suspend_user':
            return <span>Administrator suspended user account: <span className="font-mono">{shortId(details.targetUserId)}</span></span>
        case 'unsuspend_user':
            return <span>Administrator reinstated user account: <span className="font-mono">{shortId(details.targetUserId)}</span></span>
        case 'update_role':
            return <span>Administrator changed role for user <span className="font-mono">{shortId(details.targetUserId)}</span> to <span className="capitalize font-bold border rounded px-1">{details.newRole}</span></span>
        case 'admin_reset_password':
            return <span>Administrator forcibly reset the password for user <span className="font-mono">{shortId(details.targetUserId)}</span></span>
        case 'admin_broadcast':
            return <span>Administrator broadcasted the message "{details.title}" to {details.recipientCount} users</span>
        case 'update_profile':
            return <span>Updated their personal profile information</span>
        case 'update_password':
            return <span>Updated their personal security credentials (password)</span>
    }

    // Fallback: If it's a simple string, return it directly
    if (typeof details === 'string') {
        return <span className="text-slate-700">{details}</span>
    }

    // Fallback: Try to format common object structures nicely as badges
    const items = []

    if (details.userId) items.push(<div key="uid" className="bg-slate-50 px-2 py-1 rounded-md"><span className="font-semibold text-slate-800">User ID:</span> <span className="font-mono text-[10px]" title={details.userId}>{shortId(details.userId)}</span></div>)
    if (details.email) items.push(<div key="email" className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md"><span className="font-semibold mix-blend-multiply">Email:</span> {details.email}</div>)
    if (details.role) items.push(<div key="role" className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md uppercase tracking-wider text-[9px] font-bold"><span className="font-semibold mix-blend-multiply opacity-75">Role:</span> {details.role}</div>)
    if (details.orderId) items.push(<div key="order" className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md"><span className="font-semibold mix-blend-multiply">Order:</span> <span className="font-mono" title={details.orderId}>{shortId(details.orderId)}</span></div>)
    if (details.status) items.push(<div key="status" className="bg-slate-50 px-2 py-1 rounded-md"><span className="font-semibold text-slate-800">Status:</span> {details.status}</div>)
    if (details.error) items.push(<div key="err" className="bg-red-50 text-red-700 px-2 py-1 rounded-md break-all"><span className="font-semibold mix-blend-multiply">Error:</span> {details.error}</div>)
    if (details.message) items.push(<div key="msg" className="bg-slate-50 px-2 py-1 rounded-md mb-1"><span className="font-semibold text-slate-800">Note:</span> {details.message}</div>)

    // For updates, try to show changes
    if (details.updates && typeof details.updates === 'object') {
        const updateKeys = Object.keys(details.updates)
        if (updateKeys.length > 0) {
            items.push(
                <div key="updates" className="bg-slate-50 px-2 py-1 rounded-md flex flex-wrap gap-1">
                    <span className="font-semibold text-slate-800 mr-1">Updated:</span>
                    {updateKeys.map(k => (
                        <span key={k} className="inline-block bg-white border border-slate-200 px-1 rounded text-[9px] font-mono">{k}</span>
                    ))}
                </div>
            )
        }
    }

    if (items.length > 0) return items

    // Ultimate fallback: render keys/values nicely if we didn't match the known ones
    return Object.entries(details).map(([k, v]) => {
        if (typeof v === 'object') return null // Skip nested objects in fallback to keep it simple
        return (
            <div key={k} className="bg-slate-50 px-2 py-1 rounded-md truncate">
                <span className="font-semibold text-slate-800 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(v)}
            </div>
        )
    }).filter(Boolean)
}

export default function AuditLogsPage() {
    const [logs, setLogs] = React.useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [actionFilter, setActionFilter] = React.useState("")
    const [startDate, setStartDate] = React.useState("")
    const [endDate, setEndDate] = React.useState("")

    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select(`
                    *,
                    profiles (
                        full_name,
                        role
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(100)

            if (error) throw error
            setLogs(data || [])
        } catch (error: any) {
            console.error("Error fetching audit logs:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchLogs()
    }, [])

    const uniqueActions = Array.from(new Set(logs.map(l => l.action))).sort()

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())

        const matchesAction = actionFilter ? log.action === actionFilter : true

        const logDate = new Date(log.created_at)
        const matchesStartDate = startDate ? logDate >= new Date(startDate) : true
        // Add time to end date so it includes the whole day
        const matchesEndDate = endDate ? logDate <= new Date(endDate + 'T23:59:59') : true

        return matchesSearch && matchesAction && matchesStartDate && matchesEndDate
    })

    const exportToCSV = () => {
        const headers = ["Timestamp", "User", "Role", "Action", "Details"]
        const rows = filteredLogs.map(log => [
            format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss'),
            log.profiles?.full_name || log.details?.email || 'System / Unknown',
            log.profiles?.role || '-',
            log.action,
            JSON.stringify(log.details)
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tighter flex items-center gap-4">
                        Audit Logs <ShieldAlert className="h-6 w-6 sm:h-8 sm:w-8 text-primary-orange" />
                    </h2>
                    <p className="text-slate-500 font-bold text-sm sm:text-base tracking-tight">
                        Comprehensive record of system activities and user actions.
                    </p>
                </div>
                <div className="flex flex-row flex-nowrap items-center gap-3 w-full overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide">
                    {/* Filters Row */}
                    <div className="flex flex-row flex-nowrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 shrink-0">
                        <Filter className="h-3.5 w-3.5 ml-1.5 text-slate-400 shrink-0" />
                        <Select
                            value={actionFilter || "all"}
                            onValueChange={(value) => setActionFilter(value === "all" ? "" : value)}
                        >
                            <SelectTrigger className="w-[140px] h-[32px] bg-white border border-slate-200 text-slate-700 text-[11px] rounded-lg px-2.5 py-1 font-medium">
                                <SelectValue placeholder="All Actions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {uniqueActions.map(action => (
                                    <SelectItem key={action} value={action}>{action}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                aria-label="Start Date"
                                title="Start Date Filters"
                                className="bg-white border border-slate-200 text-slate-700 text-[10px] rounded-lg px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary-orange/50 h-[30px] w-[95px] shrink-0"
                            />
                            <span className="text-slate-400 text-[9px] font-bold uppercase shrink-0 px-0.5">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                aria-label="End Date"
                                title="End Date Filter"
                                className="bg-white border border-slate-200 text-slate-700 text-[10px] rounded-lg px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary-orange/50 h-[30px] w-[95px] shrink-0"
                            />
                        </div>
                    </div>

                    {/* Search & Actions */}
                    <div className="flex flex-row flex-nowrap items-center gap-2 shrink-0 flex-1 min-w-[280px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-orange/50 w-full h-[36px]"
                            />
                        </div>
                        <button
                            onClick={exportToCSV}
                            disabled={filteredLogs.length === 0}
                            className="flex flex-nowrap items-center justify-center gap-1.5 text-slate-600 hover:text-primary-blue bg-white px-3 py-1 rounded-xl border border-slate-200 hover:border-primary-blue transition-colors disabled:opacity-50 text-[10px] font-bold uppercase shrink-0 h-[36px]"
                            title="Export to CSV"
                        >
                            <Download className="h-3.5 w-3.5 shrink-0" /> <span className="shrink-0">Export</span>
                        </button>
                        <button
                            onClick={fetchLogs}
                            className="flex items-center justify-center text-primary-orange bg-orange-50 w-[36px] h-[36px] rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors shrink-0"
                            title="Refresh logs"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <RefreshCw className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading && logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-orange" />
                                    </td>
                                </tr>
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-6 text-xs text-slate-500 font-medium whitespace-nowrap">
                                            {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">
                                                    {log.profiles?.full_name || log.details?.email || 'System / Unknown'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                                    {log.profiles?.role || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                log.action.includes('error') ? "bg-red-50 text-red-600 border-red-100" :
                                                    log.action.includes('login') ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        "bg-green-50 text-green-600 border-green-100"
                                            )}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1 text-[11px] text-slate-600 max-w-sm leading-relaxed">
                                                {formatDetails(log.action, log.details)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                                            <FileText className="h-10 w-10 text-slate-300" />
                                            <p className="text-sm font-bold text-slate-400">No logs found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
