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
    Clock,
    Truck,
    Inbox,
    Loader2,
    Eye,
    Info,
    CheckCircle2,
    RefreshCw,
    Copy as CopyIcon
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
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { FeedbackPanel } from "@/components/portal/feedback-panel"
import { X, Package, ChevronRight, MessageSquare, ArrowRight } from "lucide-react"
import { SearchBar } from "@/components/portal/search-bar"
import { createProxyOrder } from "./actions"

export default function AgentDashboard() {
    const { profile, user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
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
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isAcceptingProxy, setIsAcceptingProxy] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string>("")

    const fetchAgentData = async () => {
        if (!user) return
        setCurrentUserId(user.id)
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
                    profiles:user_id (full_name),
                    quotes (*)
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
                { label: "Pending Review", value: activeRequests.toString(), change: "Action needed", trend: "up" },
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

    const handleAcceptOnBehalf = async () => {
        if (!selectedRequest || !selectedRequest.quotes?.[0] || !user) return

        setIsAcceptingProxy(true)
        const quote = selectedRequest.quotes[0]

        // Hard timeout to prevent "loading forever"
        const timeoutId = setTimeout(() => {
            if (isAcceptingProxy) {
                setIsAcceptingProxy(false)
                toast.error("Proxy Conversion Latency", {
                    description: "The order is taking longer than expected to process. Please wait a moment."
                })
            }
        }, 30000)

        try {
            console.log('--- STARTING PROXY ORDER CONVERSION ---')
            console.log('--- STARTING PROXY ORDER CONVERSION ---')

            const result = await createProxyOrder({
                userId: selectedRequest.user_id,
                agentId: user.id,
                quoteId: quote.id,
                requestId: selectedRequest.id
            })

            console.log('--- PROXY ORDER RESULT:', result)

            if (!result.success) {
                throw new Error(result.error || "Server Action Failed")
            }

            toast.success("Order Submitted for Verification", {
                description: "The order has been created. An Admin must verify the payment before it moves to the Order Pipeline."
            })

            setIsDetailsOpen(false)
            fetchAgentData()
        } catch (error: any) {
            console.error("Proxy acceptance error:", error)
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            })
            toast.error("Proxy Action Failed", { description: error.message || "A database error occurred." })
        } finally {
            clearTimeout(timeoutId)
            setIsAcceptingProxy(false)
        }
    }

    useEffect(() => {
        fetchAgentData()
    }, [user])

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

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


    const filteredOrders = orders.filter(order => {
        if (!debouncedSearch) return true
        const searchLower = debouncedSearch.toLowerCase()
        return (
            order.profiles?.full_name?.toLowerCase().includes(searchLower) ||
            order.id?.toLowerCase().includes(searchLower) ||
            order.quotes?.sourcing_requests?.vehicle_info?.toLowerCase().includes(searchLower) ||
            order.quotes?.sourcing_requests?.part_name?.toLowerCase().includes(searchLower)
        )
    })

    const filteredSourcing = sourcingRequests.filter(req => {
        if (!debouncedSearch) return true
        const searchLower = debouncedSearch.toLowerCase()
        return (
            req.profiles?.full_name?.toLowerCase().includes(searchLower) ||
            req.part_name?.toLowerCase().includes(searchLower) ||
            req.vehicle_info?.toLowerCase().includes(searchLower) ||
            req.vin?.toLowerCase().includes(searchLower)
        )
    })


    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 leading-none">Agent Command</h2>
                    <p className="text-slate-500 font-medium text-lg pt-2 max-w-2xl">Overview of your sourcing activities and performance.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchAgentData}
                    disabled={isLoading}
                    className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-sm"
                >
                    <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Update Feed
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className={cn(
                        "border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-white ring-1 ring-slate-100/50",
                        i === 0 ? "hover:border-blue-100" :
                            i === 1 ? "hover:border-orange-100" :
                                i === 2 ? "hover:border-purple-100" : "hover:border-green-100"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5 md:p-6">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {stat.label === "Active Requests" ? "Pipeline Volume" :
                                    stat.label === "Responses Provided" ? "Dispatched Quotes" :
                                        stat.label === "Pending Review" ? "Action Required" : "Sourcing Success"}
                            </CardTitle>
                            <div className={cn(
                                "h-8 w-8 md:h-10 md:w-10 rounded-2xl flex items-center justify-center shadow-inner",
                                i === 0 ? "bg-blue-50 text-blue-600" :
                                    i === 1 ? "bg-orange-50 text-orange-600" :
                                        i === 2 ? "bg-purple-50 text-purple-600" : "bg-green-50 text-green-600"
                            )}>
                                {i === 0 ? <Activity className="h-4 w-4 md:h-5 md:w-5" /> :
                                    i === 1 ? <FileText className="h-4 w-4 md:h-5 md:w-5" /> :
                                        i === 2 ? <Clock className="h-4 w-4 md:h-5 md:w-5" /> :
                                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />}
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 md:p-6 pt-0">
                            <div className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900">{stat.value}</div>
                            <div className="flex items-center text-[10px] mt-2 font-bold uppercase tracking-tight">
                                {stat.trend === 'up' ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-600" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                )}
                                <span className={stat.trend === 'up' ? "text-emerald-600" : "text-red-600"}>
                                    {stat.change}
                                </span>
                                <span className="text-slate-400 ml-2">Real-time Data</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Sourcing Pipeline */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl md:rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100/50">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 p-6 md:p-10">
                    <div className="space-y-1">
                        <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                            <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary-orange" /> Sourcing Pipeline
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium pt-1 text-sm md:text-base">Active requests assigned to you for part location and pricing.</CardDescription>
                    </div>
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search by part, vehicle, or customer..."
                        className="flex-1 md:max-w-md"
                    />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 md:pl-10 h-12 md:h-14 whitespace-nowrap">Request ID</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 md:h-14 whitespace-nowrap">Created</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 md:h-14 whitespace-nowrap">Customer</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 md:h-14 whitespace-nowrap">Part & Vehicle</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 md:h-14 whitespace-nowrap">Status</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 md:h-14 whitespace-nowrap">Messages</TableHead>
                                    <TableHead className="text-right font-bold text-slate-400 text-[10px] uppercase tracking-widest pr-6 md:pr-10 h-12 md:h-14 whitespace-nowrap">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSourcing.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">No active sourcing requests.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSourcing.map((req) => (
                                        <TableRow key={req.id} className="hover:bg-orange-50/20 border-slate-50 group">
                                            <TableCell className="pl-6 md:pl-10 py-4 md:py-6 font-bold text-slate-900">
                                                {req.status === 'pending' ? (
                                                    <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed">
                                                        Processing...
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-[10px] cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1.5 w-fit pr-2.5 bg-white border-slate-200 text-slate-500 whitespace-nowrap"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            if (req.id) {
                                                                navigator.clipboard.writeText(req.id)
                                                                toast.success("Tracking ID copied to clipboard")
                                                            }
                                                        }}
                                                    >
                                                        Ref: {req.id.slice(0, 8)}
                                                        <CopyIcon className="h-3 w-3 text-slate-400" />
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4 md:py-6 font-medium text-slate-500 whitespace-nowrap text-xs">
                                                {format(new Date(req.created_at), 'MMM dd, yyyy • h:mm a')}
                                            </TableCell>
                                            <TableCell className="py-4 md:py-6 font-medium text-slate-600 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span>{req.is_proxy_request ? req.customer_name : req.profiles?.full_name}</span>
                                                    {req.is_proxy_request && (
                                                        <span className="text-[10px] text-primary-orange font-bold uppercase tracking-tighter">Proxy Request</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 md:py-6">
                                                <div className="flex flex-col min-w-[150px]">
                                                    <span className="font-bold text-slate-800 truncate">{req.part_name}</span>
                                                    <span className="text-xs text-slate-500 truncate">{req.vehicle_info}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 md:py-6">
                                                <Badge className={cn(
                                                    "rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap",
                                                    req.status === 'pending' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                                                )}>
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 md:py-6">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-3 rounded-xl hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border border-transparent hover:border-blue-100 transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedRequest(req)
                                                        setIsDetailsOpen(true)
                                                    }}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    Chat
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 md:pr-10 py-4 md:py-6">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => {
                                                        setSelectedRequest(req)
                                                        setIsDetailsOpen(true)
                                                    }}
                                                >
                                                    Manage
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <ResponsiveModal
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                title="Sourcing Command Console"
                description={`Request ID: ${selectedRequest?.id.slice(0, 8)}`}
                size="xl"
            >
                <div className="w-full bg-white p-1">
                    {/* Body - 2 Column Layout for Desktop */}
                    <div className="flex-1">
                        <div className="flex flex-col lg:flex-row">

                            {/* Left Column: Details (Scrollable) */}
                            <div className="flex-1 p-8 space-y-6 bg-white lg:border-r border-slate-100">
                                {/* Vehicle Info Section */}
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Target Vehicle</p>
                                            <h4 className="text-2xl font-semibold text-slate-900 tracking-tight leading-tight">{selectedRequest?.part_name}</h4>
                                            {selectedRequest?.part_condition && (
                                                <Badge variant="outline" className={cn(
                                                    "mt-2 w-fit font-bold px-2 py-0.5 text-[10px] uppercase tracking-widest border-none",
                                                    selectedRequest.part_condition === 'New (OEM)' ? "bg-emerald-100 text-emerald-700" :
                                                        selectedRequest.part_condition === 'Aftermarket' ? "bg-blue-100 text-blue-700" :
                                                            "bg-amber-100 text-amber-700"
                                                )}>
                                                    {selectedRequest.part_condition}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shrink-0 shadow-sm">
                                            <Package className="h-6 w-6 text-primary-orange" />
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white rounded-2xl border border-slate-100/50 text-sm font-medium text-slate-600 leading-relaxed shadow-sm">
                                        {selectedRequest?.vehicle_info}
                                    </div>
                                </div>

                                {/* Quote Visibility */}
                                {selectedRequest?.quotes?.[0] && (
                                    <div className="p-6 bg-slate-950 rounded-2xl shadow-xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-orange">Active Quote Details</p>
                                            <Badge variant="outline" className="border-primary-orange/20 text-primary-orange text-[9px] uppercase tracking-widest">{selectedRequest.status}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Total Amount</p>
                                                <p className="text-3xl font-bold text-white tracking-tighter">${selectedRequest.quotes[0].total_amount}</p>
                                            </div>
                                            <div className="space-y-1 text-right border-l border-white/10 pl-4">
                                                <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Net Item Price</p>
                                                <p className="text-xl font-bold text-white/80">${selectedRequest.quotes[0].item_price}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Data Sections */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-slate-50/30 rounded-2xl border border-slate-100/50 space-y-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Customer</p>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-[10px] shadow-lg">
                                                {selectedRequest?.profiles?.full_name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <p className="font-semibold text-slate-900 text-lg tracking-tight">{selectedRequest?.profiles?.full_name}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50/30 rounded-2xl border border-slate-100/50 space-y-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">VIN Number</p>
                                        <div className="h-12 rounded-xl bg-slate-950 flex items-center px-5 shadow-xl">
                                            <p className="font-mono font-medium text-white tracking-[0.1em] text-xs">
                                                {selectedRequest?.vin || 'NOT PROVIDED'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Agent Protocol */}
                                <div className="p-6 bg-blue-50/30 rounded-2xl border border-blue-100/50 flex flex-col gap-6">
                                    <div className="flex gap-6">
                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                                            <Info className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-[0.2em]">Action Protocol</p>
                                            <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                                Verify part availability and pricing. Use messaging for clarifications.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Proxy Acceptance Button - Only if status is 'quoted' */}
                                    {selectedRequest?.status === 'quoted' && (
                                        <Button
                                            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-500/20 transition-all active:scale-95 group border-none"
                                            onClick={handleAcceptOnBehalf}
                                            disabled={isAcceptingProxy}
                                        >
                                            {isAcceptingProxy ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-3">
                                                    {selectedRequest.user_id === user?.id ? "Accept Quote" : "Accept on Client's Behalf"}
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                                </span>
                                            )}
                                        </Button>
                                    )}

                                    {/* Action Button inside container to avoid scroll on modal */}
                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 rounded-xl font-semibold uppercase tracking-[0.15em] text-[10px] text-slate-500 hover:text-slate-900 hover:bg-white/50 border border-blue-100/50 transition-all shadow-sm"
                                        onClick={() => setIsDetailsOpen(false)}
                                    >
                                        Return to Pipeline
                                    </Button>
                                </div>
                            </div>

                            {/* Right Column: Feedback/Messaging (Synced Height) */}
                            <div className="lg:w-[500px] bg-white flex flex-col flex-1 lg:h-full overflow-hidden">
                                {selectedRequest && currentUserId && (
                                    <FeedbackPanel
                                        requestId={selectedRequest.id}
                                        currentUserId={currentUserId}
                                        isAgent={true}
                                    />
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </ResponsiveModal>
        </div>
    )
}
