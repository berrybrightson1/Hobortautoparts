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
import { Search, Filter, MoreHorizontal, ShoppingBag, Loader2, CheckCircle2, Clock, AlertCircle, DollarSign, UserCircle, Truck, RefreshCw, MessageSquare, X, Activity } from "lucide-react"
import { SearchBar } from "@/components/portal/search-bar"
import { Pagination } from "@/components/portal/pagination"
import { useAuth } from "@/components/auth/auth-provider"
import { FeedbackPanel } from "@/components/portal/feedback-panel"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getAdminOrders, updateOrderStatus, updateServiceFee } from "@/app/actions/order-actions"
import { ResponsiveModal } from "@/components/ui/responsive-modal"

export default function AdminOrdersPage() {
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    // Service Fee Editing State
    const [isEditingFee, setIsEditingFee] = useState(false)
    const [tempFee, setTempFee] = useState('')
    const [isUpdatingFee, setIsUpdatingFee] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(20)

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

        // Hard timeout to prevent "loading forever"
        const timeoutId = setTimeout(() => {
            if (updatingId === id) {
                setUpdatingId(null)
                toast.error("Update Latency", {
                    description: "The order status is taking longer than expected to update. Please wait a moment."
                })
            }
        }, 30000)

        const result = await updateOrderStatus(id, newStatus)
        if (result.success) {
            toast.success(`Order marked as ${newStatus}`)
            fetchData()
        } else {
            toast.error("Update failed")
        }
        setUpdatingId(null)
        clearTimeout(timeoutId)
    }

    const handleUpdateFee = async () => {
        if (!selectedOrder?.quote_id) return

        setIsUpdatingFee(true)
        const fee = parseFloat(tempFee)

        if (isNaN(fee) || fee < 0) {
            toast.error("Invalid Fee", { description: "Please enter a valid positive number" })
            setIsUpdatingFee(false)
            return
        }

        const result = await updateServiceFee(selectedOrder.quote_id, fee)

        if (result.success) {
            toast.success("Service Fee Updated", { description: "Order total has been recalculated." })
            setIsEditingFee(false)
            fetchData() // Refresh data
            // Also update selectedOrder locally to reflect change immediately if possible, 
            // but fetching is safer to get dependent total_amount.
            // We'll rely on fetchData + useEffect to update selectedOrder?
            // Actually, fetchData updates `orders`. `selectedOrder` is a separate state reference.
            // We need to re-find the order in the new data or update it manually.
            // Let's close the modal for now or just trigger a refresh.
            setIsDetailsOpen(false)
        } else {
            toast.error("Update Failed", { description: result.error })
        }
        setIsUpdatingFee(false)
    }

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1) // Reset to first page on new search
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const filteredOrders = orders.filter(order => {
        const matchesSearch = !debouncedSearch ||
            order.id?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            order.profiles?.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            order.tracking_number?.toLowerCase().includes(debouncedSearch.toLowerCase())

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredOrders.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize)


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
                    {['all', 'pending_payment', 'paid', 'processing', 'completed'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            onClick={() => setStatusFilter(status)}
                            className="capitalize rounded-xl h-9 text-xs font-bold tracking-wide"
                        >
                            {status.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 p-6">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search by Order ID, Customer Name, Tracking..."
                        className="flex-1 md:max-w-md"
                    />
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
                                <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Messages</TableHead>
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
                            ) : paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 group">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <ShoppingBag className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 font-mono">#{order.id.slice(0, 8)}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                                        {format(new Date(order.created_at), 'MMM dd, yyyy • h:mm a')}
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
                                                order.status === 'paid' || order.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
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
                                        <TableCell className="py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedOrder(order)
                                                    setIsDetailsOpen(true)
                                                }}
                                                className="h-9 px-3 rounded-xl hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border border-transparent hover:border-blue-100 transition-all"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                Chat
                                            </Button>
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
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'pending_payment')} className="text-xs font-bold px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <AlertCircle className="mr-2 h-4 w-4 text-orange-500" /> Mark Pending
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
                    {filteredOrders.length > pageSize && (
                        <div className="p-4 border-t border-slate-50">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalCount={filteredOrders.length}
                                pageSize={pageSize}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <ResponsiveModal
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                title="Order Command Console"
                description={`Order ID: #${selectedOrder?.id.slice(0, 8)}`}
                size="xl"
            >
                <div className="w-full bg-white p-1">
                    {/* Body - 2 Column Layout */}
                    <div className="flex-1">
                        <div className="flex flex-col lg:flex-row">
                            {/* Left Column: Details */}
                            <div className="flex-1 p-8 space-y-6 bg-white lg:border-r border-slate-100">
                                {/* Financial Stats Section */}
                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                                            <DollarSign className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Financial Breakdown</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100/50 shadow-sm">
                                            <span className="text-slate-600 font-semibold uppercase tracking-[0.1em] text-[10px]">Net Item Price</span>
                                            <span className="text-slate-900 font-mono font-medium text-base">${selectedOrder?.quotes?.item_price?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100/50 shadow-sm">
                                            <span className="text-slate-600 font-semibold uppercase tracking-[0.1em] text-[10px]">Global Logistics</span>
                                            <span className="text-slate-900 font-mono font-medium text-base">${selectedOrder?.quotes?.shipping_cost?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100/50 shadow-sm">
                                            <span className="text-slate-600 font-semibold uppercase tracking-[0.1em] text-[10px]">Platform Service Fee</span>
                                            {isEditingFee ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        value={tempFee}
                                                        onChange={(e) => setTempFee(e.target.value)}
                                                        className="h-8 w-20 text-right font-mono"
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                        onClick={handleUpdateFee}
                                                        disabled={isUpdatingFee}
                                                    >
                                                        {isUpdatingFee ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                        onClick={() => setIsEditingFee(false)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-900 font-mono font-medium text-base">${selectedOrder?.quotes?.service_fee?.toFixed(2)}</span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 text-slate-400 hover:text-blue-600"
                                                        onClick={() => {
                                                            setTempFee(selectedOrder?.quotes?.service_fee?.toString() || '0')
                                                            setIsEditingFee(true)
                                                        }}
                                                    >
                                                        <RefreshCw className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-4">
                                            <div className="flex justify-between items-end p-6 bg-slate-950 rounded-2xl shadow-xl relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-primary-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="space-y-1 relative z-10">
                                                    <span className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em]">Total Receivable</span>
                                                    <p className="text-3xl font-semibold text-white tracking-tight leading-none">${selectedOrder?.quotes?.total_amount?.toFixed(2)}</p>
                                                </div>
                                                <Badge className={cn(
                                                    "rounded-lg px-3 py-1 font-semibold text-[9px] uppercase tracking-[0.1em] border-none shadow-xl relative z-10",
                                                    selectedOrder?.status === 'paid' || selectedOrder?.status === 'completed' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                                                )}>
                                                    {selectedOrder?.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Section */}
                                <div className="p-6 bg-blue-50/20 rounded-3xl border border-blue-100/50 space-y-6">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">Customer Identity</p>
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-[10px] shadow-xl">
                                                {selectedOrder?.profiles?.full_name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="font-semibold text-slate-900 text-lg tracking-tight">{selectedOrder?.profiles?.full_name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium tracking-wide">{selectedOrder?.profiles?.phone_number || 'CONTACT NOT SPECIFIED'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button inside container to avoid scroll on modal */}
                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 rounded-xl font-semibold uppercase tracking-[0.2em] text-[10px] text-slate-500 hover:text-slate-900 hover:bg-white transition-all border border-blue-100/50"
                                        onClick={() => setIsDetailsOpen(false)}
                                    >
                                        Return to Orders
                                    </Button>
                                </div>
                            </div>

                            {/* Right Column: Feedback (Synced Height) */}
                            <div className="lg:w-[500px] bg-white flex flex-col flex-1 lg:h-full overflow-hidden">
                                {selectedOrder?.quotes?.request_id ? (
                                    <FeedbackPanel
                                        requestId={selectedOrder.quotes.request_id}
                                        currentUserId={user?.id || ""}
                                        isAgent={true}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-200 text-center p-16">
                                        <MessageSquare className="h-12 w-12 mb-6 opacity-20" />
                                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-60">No Messaging Active</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ResponsiveModal>
        </div >
    )
}
