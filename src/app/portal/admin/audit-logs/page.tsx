"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { Loader2, ShieldAlert, Search, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function AuditLogsPage() {
    const [logs, setLogs] = React.useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")

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

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange/50 w-64"
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 text-primary-orange font-bold text-[10px] uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                    </button>
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
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading && logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center">
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
                                                    {log.profiles?.full_name || 'System / Unknown'}
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
                                            <pre className="text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg max-w-xs overflow-x-auto whitespace-pre-wrap">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        </td>
                                        <td className="p-6 text-xs text-slate-400 font-mono">
                                            {log.ip_address}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center">
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
