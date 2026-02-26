"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Search,
    Inbox,
    ClipboardList,
    RefreshCw,
    MessageSquare,
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { format } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Merged row type: a sourcing request + its quotes + its resulting order (if any)
interface PipelineRow {
    id: string             // sourcing_request id
    created_at: string
    part_name: string
    vehicle_info: string
    vin?: string
    request_status: string // pending | quoted | completed etc.
    order?: {
        id: string
        status: string
        transaction_ref?: string
    } | null
    quote?: {
        id: string
        total_amount: string
        item_price?: string
    } | null
    customer_name?: string  // for admins/agents
    is_proxy?: boolean
}

// Unified display status derived from request + order state
function getDisplayStatus(row: PipelineRow): { label: string; color: string } {
    if (row.order) {
        const s = row.order.status
        if (s === 'completed') return { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' }
        if (s === 'paid') return { label: 'Paid', color: 'bg-emerald-100 text-emerald-700' }
        if (s === 'processing') return { label: 'Processing', color: 'bg-blue-100 text-blue-700' }
        if (s === 'shipped') return { label: 'Shipped', color: 'bg-cyan-100 text-cyan-700' }
        if (s === 'pending_payment') return { label: 'Pending Payment', color: 'bg-orange-100 text-orange-600' }
        if (s === 'pending') return { label: 'Order Pending', color: 'bg-yellow-100 text-yellow-700' }
        if (s === 'cancelled') return { label: 'Cancelled', color: 'bg-red-100 text-red-600' }
        return { label: s.replace(/_/g, ' '), color: 'bg-slate-100 text-slate-600' }
    }
    // No order yet — read from sourcing request status
    if (row.request_status === 'quoted') return { label: 'Quote Ready', color: 'bg-primary-orange/10 text-primary-orange' }
    if (row.request_status === 'pending') return { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700' }
    if (row.request_status === 'processing') return { label: 'In Progress', color: 'bg-blue-100 text-blue-700' }
    if (row.request_status === 'completed') return { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' }
    if (row.request_status === 'cancelled') return { label: 'Cancelled', color: 'bg-red-100 text-red-600' }
    return { label: row.request_status.replace(/_/g, ' '), color: 'bg-slate-100 text-slate-600' }
}

const STATUS_FILTERS = ['All', 'Pending Review', 'Quote Ready', 'Order Pending', 'Pending Payment', 'Paid', 'Processing', 'Shipped', 'Completed', 'Cancelled']

export default function OrdersPage() {
    const { user, profile } = useAuth()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const [rows, setRows] = useState<PipelineRow[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchPipeline = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            console.log(`[Orders Page] Fetching pipeline — role: ${profile?.role}, userId: ${user.id}`)

            // Query sourcing_requests with nested quotes + orders
            let query = supabase
                .from('sourcing_requests')
                .select(`
                    id,
                    created_at,
                    part_name,
                    vehicle_info,
                    vin,
                    status,
                    is_proxy_request,
                    customer_name,
                    profiles:user_id (
                        full_name
                    ),
                    quotes (
                        id,
                        total_amount,
                        item_price,
                        orders (
                            id,
                            status,
                            transaction_ref
                        )
                    )
                `)
                .order('created_at', { ascending: false })

            if (profile?.role === 'customer') {
                console.log('[Orders Page] Filtering sourcing_requests by user_id:', user.id)
                query = query.eq('user_id', user.id)
            } else if (profile?.role === 'agent') {
                console.log('[Orders Page] Filtering sourcing_requests by agent_id:', user.id)
                query = query.eq('agent_id', user.id)
            } else {
                console.log('[Orders Page] Admin — fetching all requests')
            }

            const { data, error } = await query

            if (error) {
                console.error('[Orders Page] Supabase error:', error.message, error)
                throw error
            }

            console.log('[Orders Page] Rows fetched:', data?.length ?? 0, data)

            // Flatten into PipelineRow
            const mapped: PipelineRow[] = (data || []).map((req: any) => {
                // A request may have multiple quotes; find the first one with an order
                const quote = req.quotes?.[0] ?? null
                const order = quote?.orders?.[0] ?? null
                return {
                    id: req.id,
                    created_at: req.created_at,
                    part_name: req.part_name,
                    vehicle_info: req.vehicle_info,
                    vin: req.vin,
                    request_status: req.status,
                    order: order ? { id: order.id, status: order.status, transaction_ref: order.transaction_ref } : null,
                    quote: quote ? { id: quote.id, total_amount: quote.total_amount, item_price: quote.item_price } : null,
                    customer_name: req.is_proxy_request ? req.customer_name : req.profiles?.full_name,
                    is_proxy: req.is_proxy_request,
                }
            })

            setRows(mapped)
        } catch (error: any) {
            console.error('[Orders Page] fetch failed:', error)
            toast.error("Failed to load pipeline", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPipeline()
    }, [user, profile])

    const filtered = rows.filter(row => {
        const matchSearch =
            !searchTerm ||
            row.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.vehicle_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.order?.id?.toLowerCase().includes(searchTerm.toLowerCase())

        const { label } = getDisplayStatus(row)
        const matchFilter = activeFilter === 'All' || label === activeFilter

        return matchSearch && matchFilter
    })

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-3">
                        <ClipboardList className="h-7 w-7 text-primary-orange" />
                        Order Pipeline
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        {profile?.role === 'admin'
                            ? 'All sourcing requests and their order status across the platform.'
                            : 'All your sourcing requests and their current status — from submission to delivery.'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchPipeline}
                    disabled={isLoading}
                    className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-sm shrink-0"
                >
                    <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Status filter chips */}
            <div className="flex gap-2 flex-wrap">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                            activeFilter === f
                                ? "bg-primary-blue text-white border-primary-blue shadow-sm"
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden bg-white">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 p-6">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by part, vehicle, VIN or customer..."
                            className="pl-10 h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest shrink-0">
                        {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
                    </p>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 h-12 whitespace-nowrap">Ref ID</TableHead>
                                    {(profile?.role === 'admin' || profile?.role === 'agent') && (
                                        <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 whitespace-nowrap">Customer</TableHead>
                                    )}
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 whitespace-nowrap">Part & Vehicle</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 whitespace-nowrap">Status</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 whitespace-nowrap">Quote</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 whitespace-nowrap">Date</TableHead>
                                    <TableHead className="text-right font-bold text-slate-400 text-[10px] uppercase tracking-widest pr-6 h-12 whitespace-nowrap">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-slate-50">
                                            {[...Array(6)].map((_, j) => (
                                                <TableCell key={j} className="py-5">
                                                    <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                                                    <Inbox className="h-8 w-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-semibold text-slate-900">No records found</p>
                                                    <p className="text-sm text-slate-500 font-medium">
                                                        {searchTerm || activeFilter !== 'All'
                                                            ? 'Try adjusting your search or filter.'
                                                            : 'Your requests will appear here once submitted.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((row) => {
                                        const { label, color } = getDisplayStatus(row)
                                        return (
                                            <TableRow key={row.id} className="hover:bg-blue-50/20 border-slate-50 group cursor-pointer transition-colors">
                                                {/* Ref ID */}
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-mono text-xs font-bold text-slate-500">
                                                            REQ-{row.id.slice(0, 8).toUpperCase()}
                                                        </span>
                                                        {row.order && (
                                                            <span className="font-mono text-[10px] text-primary-orange font-semibold">
                                                                ORD-{row.order.id.slice(0, 8).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Customer (admin/agent only) */}
                                                {(profile?.role === 'admin' || profile?.role === 'agent') && (
                                                    <TableCell className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-slate-800 text-sm">{row.customer_name || 'Anonymous'}</span>
                                                            {row.is_proxy && (
                                                                <span className="text-[10px] text-primary-orange font-bold uppercase tracking-tighter">Proxy</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )}

                                                {/* Part & Vehicle */}
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col min-w-[160px]">
                                                        <span className="font-bold text-slate-900 text-sm truncate">{row.part_name}</span>
                                                        <span className="text-xs text-slate-500 truncate">{row.vehicle_info}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell className="py-4">
                                                    <Badge className={cn("rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap border-none", color)}>
                                                        {label}
                                                    </Badge>
                                                </TableCell>

                                                {/* Quote amount */}
                                                <TableCell className="py-4">
                                                    {row.quote ? (
                                                        <span className="font-bold text-slate-900 text-sm">
                                                            ${row.quote.total_amount}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 font-medium">Awaiting quote</span>
                                                    )}
                                                </TableCell>

                                                {/* Date */}
                                                <TableCell className="py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                                                    {format(new Date(row.created_at), 'MMM dd, yyyy')}
                                                    <br />
                                                    <span className="text-slate-400">{format(new Date(row.created_at), 'h:mm a')}</span>
                                                </TableCell>

                                                {/* Action */}
                                                <TableCell className="text-right pr-6 py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="rounded-xl font-bold text-[10px] uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-100 flex items-center gap-1.5 ml-auto"
                                                        onClick={() => router.push(`/portal/customer/requests/${row.id}`)}
                                                    >
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
