"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Search, Filter, Inbox, Loader2, Package, ChevronRight, RefreshCw, DollarSign, MessageSquare, CheckCircle2, Clock } from "lucide-react"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { FeedbackPanel } from "@/components/portal/feedback-panel"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Truck } from "lucide-react"
import { getShipmentByOrderId } from "@/app/actions/shipment-actions"
import { ShipmentTimeline } from "@/components/portal/shipment-timeline"
import { SearchBar } from "@/components/portal/search-bar"
import { Pagination } from "@/components/portal/pagination"

export default function AgentOrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(20)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [shipment, setShipment] = useState<any>(null)
    const [isLoadingShipment, setIsLoadingShipment] = useState(false)

    const fetchOrders = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    quotes:quote_id (
                        *,
                        sourcing_requests (*)
                    )
                `)
                .eq('agent_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error: any) {
            console.error("Error fetching agent orders:", error)
            toast.error("Fetch Failed", { description: "Could not synchronize your order pipeline." })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [user])

    useEffect(() => {
        if (selectedOrder && isDetailsOpen) {
            const fetchShipment = async () => {
                setIsLoadingShipment(true)
                try {
                    const result = await getShipmentByOrderId(selectedOrder.id)
                    if (result.success) {
                        setShipment(result.data)
                    } else {
                        setShipment(null)
                    }
                } catch (e) {
                    console.error("Failed to fetch shipment", e)
                } finally {
                    setIsLoadingShipment(false)
                }
            }
            fetchShipment()
        } else {
            setShipment(null)
        }
    }, [selectedOrder, isDetailsOpen])

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1) // Reset to first page on new search
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const filteredOrders = orders.filter(order => {
        if (!debouncedSearch) return true
        const searchLower = debouncedSearch.toLowerCase()
        return (
            order.id.toLowerCase().includes(searchLower) ||
            order.profiles?.full_name?.toLowerCase().includes(searchLower) ||
            order.quotes?.sourcing_requests?.part_name?.toLowerCase().includes(searchLower) ||
            order.quotes?.sourcing_requests?.vehicle_info?.toLowerCase().includes(searchLower)
        )
    })

    const totalPages = Math.ceil(filteredOrders.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize)


    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 leading-none">Order Pipeline</h2>
                    <p className="text-slate-500 font-medium text-lg pt-2">Manage fulfillment and shipments for confirmed sourcing orders.</p>
                </div>
                <Button variant="outline" onClick={fetchOrders} className="rounded-xl border-slate-200">
                    <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Refresh
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search by Order ID or Client..."
                    className="w-full md:w-96"
                />
            </div>

            {isLoading ? (
                <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-orange" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading your Pipeline...</p>
                </div>
            ) : paginatedOrders.length > 0 ? (
                <div className="grid gap-6">
                    {paginatedOrders.map((order) => (
                        <Card key={order.id} className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100/50 hover:shadow-2xl transition-all duration-300">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 shadow-inner">
                                        <Package className="h-8 w-8 text-primary-blue" />
                                    </div>
                                    <div className="flex-1 space-y-2 min-w-0 w-full text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <h3 className="text-2xl font-bold tracking-tight text-slate-900 truncate">
                                                {order.quotes?.sourcing_requests?.part_name || 'Vehicle Part Order'}
                                            </h3>
                                            <Badge className={cn("w-fit mx-auto md:mx-0 px-4 py-1.5 rounded-lg border-none shadow-sm font-semibold text-[10px] uppercase tracking-widest",
                                                order.status === 'paid' ? "bg-emerald-50 text-emerald-600" :
                                                    order.status === 'processing' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"
                                            )}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                                            <span className="flex items-center gap-2">
                                                <Inbox className="h-4 w-4 text-slate-300" /> ID: {order.id.slice(0, 8)}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <ShoppingBag className="h-4 w-4 text-slate-300" /> Client: {order.profiles?.full_name}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="rounded-xl h-12 px-6 group border border-slate-100 hover:bg-slate-50 shrink-0"
                                        onClick={() => {
                                            setSelectedOrder(order)
                                            setIsDetailsOpen(true)
                                        }}
                                    >
                                        Details <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredOrders.length > pageSize && (
                        <div className="mt-8 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalCount={filteredOrders.length}
                                pageSize={pageSize}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl bg-white ring-1 ring-slate-100/50 p-8">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="h-24 w-24 bg-slate-50 rounded-2xl flex items-center justify-center ring-1 ring-slate-100">
                            <ShoppingBag className="h-10 w-10 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Quiet in the pipeline</h3>
                            <p className="text-slate-500 text-lg max-w-sm">No confirmed orders found. Completed sourcing requests will appear here once converted to paid status.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
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
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-6">
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
                                            <span className="text-slate-900 font-mono font-medium text-base">${selectedOrder?.quotes?.service_fee?.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-4">
                                            <div className="flex justify-between items-end p-6 bg-slate-950 rounded-2xl shadow-xl relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="space-y-1 relative z-10">
                                                    <span className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em]">Total Value</span>
                                                    <p className="text-3xl font-semibold text-white tracking-tight leading-none">${selectedOrder?.quotes?.total_amount?.toFixed(2)}</p>
                                                </div>
                                                <Badge className={cn(
                                                    "rounded-lg px-3 py-1 font-semibold text-[9px] uppercase tracking-[0.1em] border-none shadow-xl relative z-10",
                                                    selectedOrder?.status === 'paid' ? "bg-emerald-500 text-white" :
                                                        selectedOrder?.status === 'completed' ? "bg-emerald-600 text-white" :
                                                            "bg-blue-500 text-white"
                                                )}>
                                                    {selectedOrder?.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipment Tracking Timeline */}
                                {(shipment || isLoadingShipment || selectedOrder?.status === 'shipped' || selectedOrder?.status === 'completed') && (
                                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Shipment Status</p>
                                                {shipment ? (
                                                    <p className="text-xs font-mono text-slate-400">Ref: #{shipment.tracking_number}</p>
                                                ) : (
                                                    <p className="text-xs font-medium text-slate-400 italic">No tracking data initialized</p>
                                                )}
                                            </div>
                                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                                <Truck className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>

                                        {isLoadingShipment ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                            </div>
                                        ) : shipment ? (
                                            <div className="border-t border-slate-50 pt-4">
                                                <ShipmentTimeline events={shipment.events || []} />
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                                <Truck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                                <p className="text-xs text-slate-500 font-medium">Shipment record not created.</p>
                                                <p className="text-[10px] text-slate-400">Order must be processed by logistics.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Customer Section */}
                                <div className="p-6 bg-blue-50/20 rounded-2xl border border-blue-100/50 space-y-6">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">Customer Identity</p>
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-[10px] shadow-xl">
                                                {selectedOrder?.profiles?.full_name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="font-semibold text-slate-900 text-lg tracking-tight">{selectedOrder?.profiles?.full_name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium tracking-wide">Client Contact Verified</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button inside container to avoid scroll on modal */}
                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 rounded-xl font-semibold uppercase tracking-[0.2em] text-[10px] text-slate-500 hover:text-slate-900 hover:bg-white transition-all border border-blue-100/50"
                                        onClick={() => setIsDetailsOpen(false)}
                                    >
                                        Return to Pipeline
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
        </div>
    )
}
