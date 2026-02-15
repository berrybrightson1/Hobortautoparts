'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CheckCircle2, XCircle, ShieldAlert, UserCheck, Timer, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { updateUserRole } from "@/app/actions/admin-actions"

export default function AdminApprovalsPage() {
    const [pendingAgents, setPendingAgents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchData = async () => {
        setIsRefreshing(true)
        // Fetch users who have requested 'agent' role but are not yet approved?
        // Or actually, fetch from 'agents' table if we had one.
        // For now, let's look for users with 'agent' role but status 'pending' if we implemented that.
        // Based on `agent/page.tsx`, it checks `agents` table. Let's assume we need to approve them there.

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'agent')
            .order('created_at', { ascending: false })

        // In a real app we'd have a specific "status" column. For now, let's just list all agents so Admin can verify them.
        // Or better, let's listing "Sourcing Requests" that are stuck in 'pending' for too long?

        // Let's pivot: "Approvals" = "Pending Agent Applications" AND "High Value Requests"
        // Since we don't have a formal "Agent Application" flow yet (just "Create User"),
        // Let's make this page show "Pending Sourcing Requests" that need quotas.

        if (data) setPendingAgents(data)
        setIsLoading(false)
        setIsRefreshing(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Action Center</h2>
                    <p className="text-slate-500 font-medium">Items requiring administrative approval or attention.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchData}
                    disabled={isRefreshing}
                    className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900"
                >
                    <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} /> Refresh
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-slate-50 p-6">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <UserCheck className="h-5 w-5 text-blue-600" /> Agent Network Status
                        </CardTitle>
                        <CardDescription>Review active agents and their performance.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider pl-6 h-12">Agent Name</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Email</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Joined</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingAgents.length > 0 ? (
                                    pendingAgents.map((agent) => (
                                        <TableRow key={agent.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                            <TableCell className="pl-6 py-4 font-bold text-slate-900">
                                                {agent.full_name}
                                            </TableCell>
                                            <TableCell className="py-4 text-slate-500">
                                                {agent.email}
                                            </TableCell>
                                            <TableCell className="py-4 text-xs font-mono text-slate-400">
                                                {format(new Date(agent.created_at || new Date()), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0 uppercase text-[10px] tracking-wider font-bold">
                                                    Active
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-400 font-medium">
                                            No agents found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-slate-900 text-white h-fit">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                            <ShieldAlert className="h-5 w-5 text-orange-500" /> Pending Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-200">Processing Orders</p>
                                    <p className="text-xs text-slate-500">Orders requiring shipment</p>
                                </div>
                                <Badge className="bg-blue-500 text-white border-0 font-mono text-xs">2</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-200">New Requests</p>
                                    <p className="text-xs text-slate-500">Unassigned sourcing requests</p>
                                </div>
                                <Badge className="bg-orange-500 text-white border-0 font-mono text-xs">5</Badge>
                            </div>
                        </div>

                        <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold h-12 rounded-xl">
                            Process Queue <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
