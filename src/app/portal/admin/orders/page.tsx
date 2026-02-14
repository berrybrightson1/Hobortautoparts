"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, ShoppingBag, CheckCircle2, Clock, AlertCircle, Inbox, Loader2, ArrowRight, CreditCard, DollarSign, PackageSearch } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

interface Order {
    id: string
    user_id: string
    quote_id: string
    status: 'pending_payment' | 'paid' | 'processing' | 'completed' | 'cancelled'
    payment_method: string | null
    transaction_ref: string | null
    created_at: string
    profiles: {
        full_name: string | null
    }
    quotes: {
        total_amount: number
        item_price: number
        shipping_cost: number
        sourcing_requests: {
            part_name: string
        }
    }
}

export default function AdminOrdersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const fetchOrders = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles (
                        full_name
                    ),
                    quotes (
                        total_amount,
                        item_price,
                        shipping_cost,
                        sourcing_requests (
                            part_name
                        )
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error: any) {
            toast.error("Failed to fetch orders", {
                description: error.message
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        setUpdatingId(orderId)
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            toast.success(`Order status updated to ${newStatus.replace('_', ' ').toUpperCase()}`)
            fetchOrders()
        } catch (error: any) {
            toast.error("Failed to update order status", {
                description: error.message
            })
        } finally {
            setUpdatingId(null)
        }
    }

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.quotes?.sourcing_requests?.part_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusConfig = (status: Order['status']) => {
        switch (status) {
            case 'pending_payment':
                return { label: 'Awaiting Payment', color: 'bg-orange-100 text-orange-700', icon: Clock }
            case 'paid':
                return { label: 'Paid & Verified', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 }
            case 'processing':
                return { label: 'In Processing', color: 'bg-blue-100 text-blue-700', icon: Loader2 }
            case 'completed':
                return { label: 'Fulfilled', color: 'bg-slate-100 text-slate-700', icon: PackageSearch }
            case 'cancelled':
                return { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle }
            default:
                return { label: status, color: 'bg-slate-100 text-slate-700', icon: Inbox }
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <h2 className="text-4xl font-semibold tracking-tighter text-slate-900 uppercase leading-none">Orders Ledger</h2>
                    </div>
                    <p className="text-slate-500 font-medium text-lg pt-2">Financial reconciliation and order lifecycle management.</p>
                </div>
            </div>

            {/* Premium Search Bar */}
            <div className="relative group max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                    placeholder="Search by Order ID, Customer Name, or Part Identity..."
                    className="h-16 pl-14 pr-6 rounded-[2rem] border-0 bg-white ring-1 ring-slate-100 focus-visible:ring-emerald-500/30 text-sm font-semibold shadow-2xl shadow-slate-200/40 transition-all placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Orders Table */}
            <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white ring-1 ring-slate-100/50">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent border-slate-50">
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] pl-10 h-16">Transaction ID</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] h-16">Entity & Asset</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] h-16">Financial Value</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] h-16">Current Status</TableHead>
                                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] h-16 text-right pr-10">Ops</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-4" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying Global Ledger...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => {
                                        const status = getStatusConfig(order.status)
                                        return (
                                            <TableRow key={order.id} className="hover:bg-slate-50/50 transition-all border-slate-50 group">
                                                <TableCell className="pl-10 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none overflow-hidden text-ellipsis w-24">#{order.id.split('-')[0]}</span>
                                                        <span className="text-[11px] font-bold text-slate-900">{format(new Date(order.created_at), 'MMM dd, HH:mm')}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-slate-900 text-sm">{order.profiles?.full_name || 'Anonymous Entity'}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                            {order.quotes?.sourcing_requests?.part_name || 'Generic Asset'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 tracking-tighter">${order.quotes?.total_amount.toFixed(2)}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            via {order.payment_method?.replace('_', ' ') || 'Unknown Channel'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn("rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider border-0 shadow-sm", status.color)}>
                                                        <status.icon className="h-3 w-3 mr-1.5" />
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-10">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100" disabled={updatingId === order.id}>
                                                                {updatingId === order.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-2 shadow-2xl border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                                                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">Workflow Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator className="bg-slate-50" />
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(order.id, 'paid')}
                                                                className="rounded-xl font-bold text-xs px-3 py-3 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                                            >
                                                                <CheckCircle2 className="mr-3 h-4 w-4" /> Verify Payment Receipt
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(order.id, 'processing')}
                                                                className="rounded-xl font-bold text-xs px-3 py-3 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                            >
                                                                <Loader2 className="mr-3 h-4 w-4" /> Move to Processing
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(order.id, 'completed')}
                                                                className="rounded-xl font-bold text-xs px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                                                            >
                                                                <ArrowRight className="mr-3 h-4 w-4" /> Mark as Fulfilled
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-50" />
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                                                className="rounded-xl font-bold text-xs px-3 py-3 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
                                                            >
                                                                <AlertCircle className="mr-3 h-4 w-4" /> Cancel Transaction
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                                    <Inbox className="h-10 w-10" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xl font-bold text-slate-900">Ledger Empty</p>
                                                    <p className="text-sm font-medium text-slate-400">Order instances will appear after customer checkout.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
