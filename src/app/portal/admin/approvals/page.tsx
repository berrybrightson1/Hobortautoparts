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
import { useRouter } from "next/navigation"

export default function AdminApprovalsPage() {
    const router = useRouter()
    const [pendingAgents, setPendingAgents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [stats, setStats] = useState({
        processingOrders: 0,
        newRequests: 0
    })

    const fetchData = async () => {
        setIsRefreshing(true)
        try {
            // 1. Fetch Agents
            const { data: agentsData } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'agent')
                .order('created_at', { ascending: false })

            if (agentsData) setPendingAgents(agentsData)

            // 2. Fetch Pending Sourcing Requests count (unassigned)
            const { count: newRequestsCount } = await supabase
                .from('sourcing_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')
                .is('agent_id', null)

            // 3. Fetch Processing Orders count (no shipment)
            // This is a bit more complex, let's look for orders with status paid/processing
            const { data: ordersData } = await supabase
                .from('orders')
                .select('id, status')
                .in('status', ['paid', 'processing'])

            // To truly check if they have no shipment, we'd need a join or a separate check
            // For now, let's fetch IDs and then check shipments table
            const orderIds = ordersData?.map(o => o.id) || []
            let processingOrdersCount = 0

            if (orderIds.length > 0) {
                const { data: shipmentsData } = await supabase
                    .from('shipments')
                    .select('order_id')
                    .in('order_id', orderIds)

                const shippedOrderIds = new Set(shipmentsData?.map(s => s.order_id) || [])
                processingOrdersCount = orderIds.filter(id => !shippedOrderIds.has(id)).length
            }

            setStats({
                newRequests: newRequestsCount || 0,
                processingOrders: processingOrdersCount
            })

        } catch (error: any) {
            console.error("Error fetching approval stats:", error)
            toast.error("Sync Failed", { description: "Could not refresh Action Center metrics." })
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
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
                <Card className="md:col-span-2 border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden bg-white">
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
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Status</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Actions</TableHead>
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
                                            <TableCell className="py-4">
                                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0 uppercase text-[10px] tracking-wider font-bold">
                                                    Active
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 rounded-lg text-xs font-bold text-primary-blue hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => router.push(`/portal/users?search=${agent.full_name}`)}
                                                >
                                                    Manage
                                                </Button>
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

                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden bg-slate-900 text-white h-fit">
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
                                <Badge className="bg-blue-500 text-white border-0 font-mono text-xs">{stats.processingOrders}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-200">New Requests</p>
                                    <p className="text-xs text-slate-500">Unassigned sourcing requests</p>
                                </div>
                                <Badge className="bg-orange-500 text-white border-0 font-mono text-xs">{stats.newRequests}</Badge>
                            </div>
                        </div>

                        <Button
                            onClick={() => router.push('/portal/admin/requests?filter=unassigned')}
                            className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold h-12 rounded-xl"
                        >
                            Process Queue <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
