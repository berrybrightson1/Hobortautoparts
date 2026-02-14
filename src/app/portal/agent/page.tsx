"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    Users,
    ShoppingCart,
    Activity,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreHorizontal,
    FileText,
    Truck,
    Inbox,
    Loader2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { format } from "date-fns"
import { PendingApproval } from "@/components/portal/pending-approval"
import { toast } from "sonner"
import { StatsSkeleton, CardSkeleton, Skeleton } from "@/components/portal/skeletons"

export default function AgentDashboard() {
    const { profile, user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [orders, setOrders] = useState<any[]>([])
    const [sourcingRequests, setSourcingRequests] = useState<any[]>([])
    const [agentStatus, setAgentStatus] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState([
        { label: "Active Requests", value: "0", change: "0%", trend: "up" },
        { label: "Responses Provided", value: "0", change: "0%", trend: "up" },
        { label: "Pending Review", value: "0", change: "0%", trend: "up" },
        { label: "Completed Sourcing", value: "0", change: "0%", trend: "up" }
    ])

    const fetchAgentData = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            // Check profile role first for admin bypass
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.error("Error fetching user role:", profileError)
            }

            const isSystemAdmin = profileData?.role === 'admin'

            // Check agent status
            const { data: agentData, error: agentError } = await supabase
                .from('agents')
                .select('status')
                .eq('id', user.id)
                .maybeSingle()

            if (agentError && agentError.code !== 'PGRST116') {
                console.error("Error fetching agent status:", agentError)
            }

            // Admins bypass the pending screen
            const status = isSystemAdmin ? 'approved' : (agentData?.status || 'pending')
            setAgentStatus(status)

            // If pending and NOT an admin, show approval screen
            if (!isSystemAdmin && (status === 'pending' || !agentData)) {
                setIsLoading(false)
                return
            }

            // For admins who are NOT registered as agents, we allow them in 
            // but they might see no data unless we fetch global data (which we won't for now to avoid bloat)
            // 1. Fetch Assigned Sourcing Requests
            const { data: sourcingData, error: sourcingError } = await supabase
                .from('sourcing_requests')
                .select(`
                    *,
                    profiles:user_id (full_name)
                `)
                .eq('agent_id', user.id)
                .order('created_at', { ascending: false })

            if (sourcingError) throw sourcingError
            setSourcingRequests(sourcingData || [])

            // 2. Fetch Assigned Orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    quotes:quote_id (*)
                `)
                .eq('agent_id', user.id)
                .order('created_at', { ascending: false })

            if (ordersError) throw ordersError
            setOrders(ordersData || [])

            // 3. Calculate Stats
            const totalRequests = sourcingData?.length || 0
            const activeRequests = sourcingData?.filter(r => r.status === 'pending' || r.status === 'processing').length || 0
            const quotedRequests = sourcingData?.filter(r => r.status === 'quoted').length || 0
            const completedRequests = sourcingData?.filter(r => r.status === 'completed' || r.status === 'shipped').length || 0

            setStats([
                { label: "Active Requests", value: activeRequests.toString(), change: "Live", trend: "up" },
                { label: "Responses Provided", value: quotedRequests.toString(), change: "View all", trend: "up" },
                { label: "Pending Review", value: (totalRequests - quotedRequests - completedRequests).toString(), change: "Action needed", trend: "up" },
                { label: "Completed Sourcing", value: completedRequests.toString(), change: "Total", trend: "up" }
            ])

        } catch (error: any) {
            console.error("Error fetching agent dashboard data:", error?.message || error)
            toast.error("Connectivity issue", {
                description: error?.message || "Failed to synchronize your dashboard data."
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAgentData()
    }, [user])

    // Show pending approval screen if agent is not approved
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
            </div>
        )
    }

    if (agentStatus === 'pending' || agentStatus === null) {
        return <PendingApproval />
    }

    const filteredOrders = orders.filter(order =>
        order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.quotes?.sourcing_requests?.vehicle_info?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredSourcing = sourcingRequests.filter(req =>
        req.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.vehicle_info?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-bold tracking-tighter text-slate-900 leading-none">Agent Command</h2>
                    <p className="text-slate-500 font-medium text-lg pt-2">Overview of your sourcing activities and performance.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className={cn(
                        "border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-white ring-1 ring-slate-100/50",
                        i === 0 ? "hover:border-green-100" :
                            i === 1 ? "hover:border-blue-100" :
                                i === 2 ? "hover:border-purple-100" : "hover:border-orange-100"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {stat.label}
                            </CardTitle>
                            <div className={cn(
                                "h-10 w-10 rounded-2xl flex items-center justify-center shadow-inner",
                                i === 0 ? "bg-green-50 text-green-600" :
                                    i === 1 ? "bg-blue-50 text-blue-600" :
                                        i === 2 ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                            )}>
                                {i === 0 ? <DollarSign className="h-5 w-5" /> :
                                    i === 1 ? <ShoppingCart className="h-5 w-5" /> :
                                        i === 2 ? <Activity className="h-5 w-5" /> :
                                            <Users className="h-5 w-5" />}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tighter text-slate-900">{stat.value}</div>
                            <div className="flex items-center text-[10px] mt-3 font-bold uppercase tracking-tight">
                                {stat.trend === 'up' ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-600" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                )}
                                <span className={stat.trend === 'up' ? "text-emerald-600" : "text-red-600"}>
                                    {stat.change}
                                </span>
                                <span className="text-slate-400 ml-2">from last month</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Sourcing Pipeline */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100/50">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 p-10">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                            <Activity className="h-6 w-6 text-primary-orange" /> Sourcing Pipeline
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium pt-1">Active requests assigned to you for part location and pricing.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-10 h-14">Request ID</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-14">Customer</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-14">Part & Vehicle</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-14">Status</TableHead>
                                    <TableHead className="text-right font-bold text-slate-400 text-[10px] uppercase tracking-widest pr-10 h-14">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSourcing.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">No active sourcing requests.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSourcing.map((req) => (
                                        <TableRow key={req.id} className="hover:bg-orange-50/20 border-slate-50 group">
                                            <TableCell className="pl-10 py-6 font-bold text-slate-900">
                                                #{req.id.slice(0, 8).toUpperCase()}
                                            </TableCell>
                                            <TableCell className="py-6 font-medium text-slate-600">
                                                {req.profiles?.full_name}
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{req.part_name}</span>
                                                    <span className="text-xs text-slate-500">{req.vehicle_info}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <Badge className={cn(
                                                    "rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider",
                                                    req.status === 'pending' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                                                )}>
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-10 py-6">
                                                <Link href={`/quote?request=${req.id}`}>
                                                    <Button variant="ghost" size="sm" className="rounded-xl font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                        Manage
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
