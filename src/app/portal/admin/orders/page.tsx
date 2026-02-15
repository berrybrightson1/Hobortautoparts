'use client'

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, ShoppingBag, Loader2, CheckCircle2, Clock, AlertCircle, DollarSign, UserCircle, Truck, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getAdminOrders, updateOrderStatus } from "@/app/actions/order-actions"
import { ResponsiveModal } from "@/components/ui/responsive-modal"

export default function AdminOrdersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    // Filter Logic
    const [statusFilter, setStatusFilter] = useState('all') // all, paid, processing, completed

    const fetchData = async () => {
        setIsLoading(true)
        const result = await getAdminOrders()
        if (result.success) {
            setOrders((result.data || []) as any)
        } else {
            toast.error("Failed to load orders")
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingId(id)
        const result = await updateOrderStatus(id, newStatus)
        if (result.success) {
            toast.success(`Order marked as ${newStatus}`)
            fetchData()
        } else {
            toast.error("Update failed")
        }
        setUpdatingId(null)
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Order Management</h2>
                    <p className="text-slate-500 font-medium">Track payments and fulfillment status.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchData}
                        disabled={isLoading}
                        className="rounded-xl h-9 text-xs font-bold tracking-wide"
                    >
                        <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                    {['all', 'paid', 'processing', 'completed'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            onClick={() => setStatusFilter(status)}
                            className="capitalize rounded-xl h-9 text-xs font-bold tracking-wide"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 p-6">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by Order ID, Customer Name..."
                            className="pl-10 h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider pl-6 h-12">Order ID</TableHead>
                                <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Customer</TableHead>
                                <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Amount</TableHead>
                                <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Payment Status</TableHead>
                                <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Shipment</TableHead>
                                <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center">
                                        <Loader2 className="h-8 w-8 text-primary-blue animate-spin mx-auto mb-2" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Orders...</p>
                                    </TableCell>
                                </TableRow>
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 group">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <ShoppingBag className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 font-mono">#{order.id.slice(0, 8)}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                                        {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{order.profiles?.full_name || 'Guest User'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-1 font-bold text-slate-900">
                                                <DollarSign className="h-3 w-3 text-slate-400" />
                                                {order.quotes?.total_amount?.toFixed(2) || '0.00'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge className={cn(
                                                "rounded-lg px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider border-0 shadow-sm",
                                                order.status === 'paid' ? "bg-emerald-50 text-emerald-600" :
                                                    order.status === 'processing' ? "bg-blue-50 text-blue-600" :
                                                        order.status === 'pending_payment' ? "bg-orange-50 text-orange-600" :
                                                            "bg-slate-100 text-slate-600"
                                            )}>
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {order.shipments && order.shipments.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-3 w-3 text-blue-500" />
                                                    <span className="text-xs font-bold text-slate-700">{order.shipments[0].tracking_number}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unfulfilled</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100" disabled={updatingId === order.id}>
                                                        {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-slate-100">
                                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1.5">Manage Order</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-slate-50" />
                                                    <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true) }} className="text-xs font-bold px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <ShoppingBag className="mr-2 h-4 w-4 text-blue-500" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-50" />
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'paid')} className="text-xs font-bold px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Mark Paid
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'processing')} className="text-xs font-bold px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <Clock className="mr-2 h-4 w-4 text-blue-500" /> Mark Processing
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'completed')} className="text-xs font-bold px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-slate-600" /> Mark Completed
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <ShoppingBag className="h-8 w-8" />
                                            </div>
                                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No orders found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ResponsiveModal open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <div className="p-8 bg-white max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order #{selectedOrder?.id.slice(0, 8)}</h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Financial Breakdown</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                        <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Item Price</span>
                            <span className="font-mono font-bold">${selectedOrder?.quotes?.item_price?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Shipping</span>
                            <span className="font-mono font-bold">${selectedOrder?.quotes?.shipping_cost?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Service Fee</span>
                            <span className="font-mono font-bold">${selectedOrder?.quotes?.service_fee?.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-slate-200 my-2" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-slate-900 uppercase">Total</span>
                            <span className="text-2xl font-black text-primary-blue">${selectedOrder?.quotes?.total_amount?.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button className="w-full h-14 bg-slate-900 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-black" onClick={() => setIsDetailsOpen(false)}>Close Review</Button>
                    </div>
                </div>
            </ResponsiveModal>
        </div>
    )
}
