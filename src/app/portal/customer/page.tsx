"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Package, Car, Clock, ChevronRight, Inbox, Loader2, Activity, RefreshCw, Copy as CopyIcon, MessageSquare, ArrowRight, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { toast } from "sonner"
import { ShieldCheck, Info, CreditCard, DollarSign } from "lucide-react"
import { StatsSkeleton, CardSkeleton, Skeleton } from "@/components/portal/skeletons"
import { FeedbackPanel } from "@/components/portal/feedback-panel"
import { X, Truck, AlertCircle } from "lucide-react"
import { getShipmentByOrderId } from "@/app/actions/shipment-actions"
import { ShipmentTimeline } from "@/components/portal/shipment-timeline"
import { sendNotification } from "@/lib/notifications"
import { SearchBar } from "@/components/portal/search-bar"

export default function CustomerDashboard() {
    const { profile, user } = useAuth()
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
    const [isAccepting, setIsAccepting] = useState(false)
    const [quote, setQuote] = useState<any>(null)
    const [shipment, setShipment] = useState<any>(null)
    const [isLoadingShipment, setIsLoadingShipment] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const fetchOrders = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('sourcing_requests')
                .select(`
                    *,
                    *,
                    quotes (
                        *,
                        orders (id, status)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error("Error fetching orders:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleViewRequest = async (request: any) => {
        setSelectedRequest(request)
        const activeQuote = request.quotes?.[0]
        setQuote(activeQuote)
        setIsQuoteModalOpen(true)

        // Fetch Shipment if Order exists
        const orderId = activeQuote?.orders?.[0]?.id || activeQuote?.orders?.id
        if (orderId) {
            setIsLoadingShipment(true)
            const result = await getShipmentByOrderId(orderId)
            if (result.success) {
                setShipment(result.data)
            } else {
                setShipment(null)
            }
            setIsLoadingShipment(false)
        } else {
            setShipment(null)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [user])

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Filter orders based on search
    const filteredOrders = orders.filter((order) => {
        if (!debouncedSearch) return true
        const searchLower = debouncedSearch.toLowerCase()
        return (
            order.part_name?.toLowerCase().includes(searchLower) ||
            order.vehicle_info?.toLowerCase().includes(searchLower) ||
            order.id?.toLowerCase().includes(searchLower) ||
            order.vin?.toLowerCase().includes(searchLower)
        )
    })


    const handleAcceptQuote = async () => {
        if (!selectedRequest || !quote || !user) return

        setIsAccepting(true)

        // Hard timeout to prevent "loading forever"
        const timeoutId = setTimeout(() => {
            if (isAccepting) {
                setIsAccepting(false)
                toast.error("Low Network or Database Latency", {
                    description: "The order is taking longer than expected to process. Please wait a moment."
                })
            }
        }, 30000)

        try {
            console.log('--- STARTING ORDER CONVERSION ---')
            // 1. Create the order
            const { error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    quote_id: quote.id,
                    agent_id: selectedRequest.agent_id,
                    status: 'paid', // Simulating successful immediate payment for now
                    payment_method: 'Platform Wallet'
                })

            if (orderError) throw orderError
            console.log('--- ORDER CREATED ---')

            // 2. Update the request status
            const { error: requestError } = await supabase
                .from('sourcing_requests')
                .update({ status: 'processing' })
                .eq('id', selectedRequest.id)

            if (requestError) throw requestError
            console.log('--- REQUEST UPDATED ---')

            // 3. Notify Admin and Agent
            try {
                // Notify admin (get first admin from profiles)
                const { data: admins } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('role', 'admin')
                    .limit(1)

                if (admins && admins.length > 0) {
                    await sendNotification({
                        userId: admins[0].id,
                        title: 'Quote Accepted',
                        message: `Customer accepted quote for ${selectedRequest.part_name}`,
                        type: 'order'
                    })
                }

                // Notify assigned agent if exists
                if (selectedRequest.agent_id) {
                    await sendNotification({
                        userId: selectedRequest.agent_id,
                        title: 'Quote Accepted',
                        message: `Customer accepted quote for ${selectedRequest.part_name}`,
                        type: 'order'
                    })
                }
                console.log('--- NOTIFICATIONS SENT ---')
            } catch (notifyErr) {
                console.warn('Non-blocking notification failure:', notifyErr)
            }

            toast.success("Order Confirmed!", {
                description: "Your part sourcing has moved to the fulfillment stage."
            })

            setIsQuoteModalOpen(false)
            fetchOrders()
        } catch (error: any) {
            console.error("Acceptance error:", error)
            toast.error("Process Failed", { description: error.message || "A database error occurred." })
        } finally {
            clearTimeout(timeoutId)
            setIsAccepting(false)
        }
    }

    // Determine status color helper
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
            case 'processing': return "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
            case 'quoted': return "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
            case 'shipped': return "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
            case 'completed': return "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
            case 'unavailable': return "bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
            default: return "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 leading-none">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'}!
                    </h2>
                    <p className="text-slate-500 font-medium text-lg pt-2 max-w-2xl">Track your orders and manage your vehicle sourcing requests.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        onClick={fetchOrders}
                        disabled={isLoading}
                        className="h-14 w-14 rounded-xl text-slate-500 hover:text-slate-900 border border-slate-200/50"
                    >
                        <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                    </Button>
                    <Button
                        onClick={() => router.push('/quote')}
                        className="flex-1 md:flex-none bg-primary-orange hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-orange-900/20 px-8 h-14 transition-all active:scale-95"
                    >
                        <Plus className="mr-3 h-5 w-5" /> New Request
                    </Button>
                </div>
            </div>

            {/* SEARCH BAR */}
            {orders.length > 0 && (
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search by part name, vehicle, order ID, or VIN..."
                    className="max-w-2xl"
                />
            )}

            {/* PROMINENT TRACKING NUMBER CARD */}
            {orders.length > 0 && orders.some(order => order.id) && (
                <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 border-none shadow-2xl shadow-blue-900/30 rounded-[2rem] overflow-hidden relative group">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-orange/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                    <CardContent className="p-6 md:p-8 relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                        <Hash className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-white/60">Your Tracking Numbers</p>
                                        <p className="text-white font-medium text-sm mt-0.5">Click any number below to copy instantly</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 md:gap-3">
                                    {orders.slice(0, 3).map((order) => order.id && (
                                        <button
                                            key={order.id}
                                            onClick={() => {
                                                navigator.clipboard.writeText(order.id)
                                                toast.success("Tracking number copied!", {
                                                    description: `${order.id} is now in your clipboard`
                                                })
                                            }}
                                            className="group/btn flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 hover:border-white/30 transition-all active:scale-95 shadow-lg hover:shadow-xl"
                                        >
                                            <span className="font-mono text-sm md:text-base font-bold text-white tracking-wider">
                                                {order.id.slice(0, 13)}...
                                            </span>
                                            <CopyIcon className="h-4 w-4 md:h-5 md:w-5 text-white/80 group-hover/btn:text-white transition-colors" />
                                        </button>
                                    ))}
                                    {orders.length > 3 && (
                                        <div className="flex items-center px-4 py-3 text-white/60 text-sm font-medium">
                                            +{orders.length - 3} more below
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                                <Info className="h-4 w-4" />
                                <span>Share these with support for faster assistance</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {/* Main Content: Orders */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                            <Clock className="h-6 w-6 text-primary-orange" /> Recent Activity
                        </h3>
                        <Button variant="link" className="text-primary-blue font-bold uppercase tracking-widest text-[10px] hover:no-underline hover:text-blue-700" disabled={orders.length === 0}>
                            View All <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                                <Loader2 className="h-8 w-8 text-primary-orange animate-spin" />
                                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Sourcing Feed...</p>
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <Card key={order.id} className="border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group rounded-[2rem] md:rounded-[2.5rem] bg-white ring-1 ring-slate-100/50">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Status Indicator Strip */}
                                            <div className={cn("w-full sm:w-2 h-2 sm:h-auto transition-colors duration-300",
                                                order.status === 'pending' ? "bg-yellow-400" :
                                                    order.status === 'processing' ? "bg-blue-400" :
                                                        order.status === 'quoted' ? "bg-purple-400" :
                                                            order.status === 'shipped' ? "bg-orange-400" :
                                                                order.status === 'completed' ? "bg-emerald-400" : "bg-slate-300"
                                            )} />

                                            <div className="flex-1 p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary-blue group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-blue-900/20">
                                                    <Package className="h-6 w-6 md:h-7 md:w-7" />
                                                </div>

                                                <div className="flex-1 space-y-1.5 min-w-0 w-full">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                                        <p className="font-bold text-lg md:text-xl text-slate-900 truncate tracking-tight">{order.vehicle_info || order.part_name}</p>
                                                        {order.status === 'pending' ? (
                                                            <Badge variant="outline" className="w-fit shrink-0 font-mono text-[10px] bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-70">
                                                                Running Checks...
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="w-fit shrink-0 font-mono text-[10px] cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1.5 pr-2.5 bg-slate-50 border-slate-100 text-slate-400"
                                                                onClick={(e) => {
                                                                    e.stopPropagation() // Prevent card click
                                                                    if (order.id) {
                                                                        navigator.clipboard.writeText(order.id)
                                                                        toast.success("Tracking ID copied to clipboard")
                                                                    }
                                                                }}
                                                            >
                                                                Ref: {order.id.slice(0, 8)}
                                                                <CopyIcon className="h-3 w-3 text-slate-400" />
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium truncate">
                                                        <span>{order.part_name}</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                                        <Badge className={cn("rounded-lg px-3 py-1 border-0 shadow-sm font-bold text-[10px] uppercase tracking-wider", getStatusColor(order.status))}>
                                                            {order.status}
                                                        </Badge>
                                                        <span className="text-[10px] text-slate-400 flex items-center font-bold uppercase tracking-widest">
                                                            <Calendar className="h-3 w-3 mr-1.5" />
                                                            {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                    <Button
                                                        onClick={() => handleViewRequest(order)}
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full sm:w-auto rounded-xl border-slate-200 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shrink-0 h-12 sm:h-10",
                                                            order.status === 'quoted' ? "bg-white border-primary-orange text-primary-orange hover:bg-orange-50" : "hover:text-primary-blue hover:border-blue-200 hover:bg-blue-50"
                                                        )}
                                                    >
                                                        Details
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleViewRequest(order)}
                                                        className={cn(
                                                            "w-full sm:w-auto rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shrink-0 h-12 sm:h-10 px-6 flex items-center gap-2 shadow-lg",
                                                            order.status === 'quoted' ? "bg-primary-orange text-white hover:bg-orange-600 shadow-orange-900/20" : "bg-primary-blue text-white hover:bg-blue-600 shadow-blue-900/20"
                                                        )}
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                        Chat
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 gap-6">
                                <div className="h-24 w-24 rounded-[2.5rem] bg-white flex items-center justify-center text-slate-200 shadow-xl shadow-slate-200/50">
                                    <Inbox className="h-10 w-10" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-2xl font-bold text-slate-900 leading-none tracking-tight">
                                        {debouncedSearch ? 'No matching requests' : 'No active requests yet'}
                                    </p>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {debouncedSearch ? 'Try adjusting your search terms' : 'When you place an order, it will appear here.'}
                                    </p>
                                </div>
                                {debouncedSearch ? (
                                    <Button
                                        onClick={() => setSearchQuery('')}
                                        variant="outline"
                                        className="rounded-full h-12 px-8 border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:border-primary-blue hover:text-primary-blue transition-all"
                                    >
                                        Clear Search
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => router.push('/quote')}
                                        variant="outline"
                                        className="rounded-full h-12 px-8 border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:border-primary-orange hover:text-primary-orange transition-all"
                                    >
                                        Create Your First Request
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>


                <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-blue-100 shadow-xl shadow-blue-100/50 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative group">
                    {/* Decorative background effects */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-orange/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary-orange/20 transition-colors" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-blue/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl group-hover:bg-primary-blue/20 transition-colors" />

                    <CardHeader className="relative z-10 pb-2 p-8">
                        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-600 text-sm space-y-8 relative z-10 p-8 pt-0">
                        <p className="font-medium leading-relaxed">Our expert agents are ready to assist you with finding the exact parts for your vehicle.</p>
                        <Button className="w-full bg-primary-blue text-white hover:bg-blue-700 font-bold uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-blue-500/20 border-0 transition-all active:scale-95">
                            Contact Support
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <ResponsiveModal
                open={isQuoteModalOpen}
                onOpenChange={setIsQuoteModalOpen}
                title="Sourcing Request Details"
                description={`Tracking ID: ${selectedRequest?.id.slice(0, 8)}`}
                size="xl"
            >
                <div className="w-full bg-white p-1">
                    {/* Body - 2 Column Layout */}
                    <div className="flex-1">
                        <div className="flex flex-col lg:flex-row">

                            {/* Left Column: Details (Scrollable) */}
                            <div className="flex-1 p-8 space-y-6 bg-white lg:border-r border-slate-100">
                                {/* Status Section */}
                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.2em]">Sourcing Progress</p>
                                            <Badge className={cn("w-fit rounded-lg px-4 py-1.5 border-none shadow-sm font-semibold text-[10px] uppercase tracking-[0.15em]", getStatusColor(selectedRequest?.status))}>
                                                {selectedRequest?.status}
                                            </Badge>
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                            <Activity className="h-5 w-5 text-slate-300" />
                                        </div>
                                    </div>
                                </div>

                                {quote ? (
                                    <div className="p-6 bg-slate-50/30 rounded-3xl border border-slate-100/50 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-5 bg-white rounded-2xl border border-slate-100/50 shadow-sm space-y-1">
                                                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.2em]">Item price</p>
                                                <p className="text-2xl font-semibold text-slate-900 leading-none tracking-tight">${quote.item_price}</p>
                                            </div>
                                            <div className="p-5 bg-white rounded-2xl border border-slate-100/50 shadow-sm space-y-1">
                                                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.2em]">Logistics Estimate</p>
                                                <p className="text-xl font-semibold text-slate-700/80 leading-none tracking-tight">${quote.shipping_cost}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <div className="p-8 bg-slate-950 rounded-2xl shadow-xl relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-primary-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="space-y-2 relative z-10">
                                                    <p className="text-[10px] font-semibold text-primary-orange uppercase tracking-[0.25em]">Total Value</p>
                                                    <p className="text-5xl font-semibold text-white tracking-tighter leading-none">${quote.total_amount}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100/50 flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                                            <Info className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-[0.2em]">Search Active</p>
                                            <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-xl">
                                                Our agents are currently auditing our global network for this component.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {quote?.notes && (
                                    <div className="p-6 bg-slate-50/20 rounded-3xl border border-slate-100/50 space-y-3">
                                        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.2em]">Agent Notes</p>
                                        <div className="text-base font-medium text-slate-600 leading-relaxed italic max-w-2xl">
                                            "{quote.notes}"
                                        </div>
                                    </div>
                                )}

                                {/* Unavailable Alert */}
                                {selectedRequest?.status === 'unavailable' && (
                                    <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-red-100">
                                            <AlertCircle className="h-6 w-6 text-red-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em]">Item Unavailable</p>
                                            <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                                We have conducted a thorough search of our suppliers and unfortunately, this part is currently out of stock or unavailable.
                                            </p>
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50 text-[10px] uppercase font-bold tracking-wider" onClick={() => router.push('/contact')}>
                                                    Contact Support
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Shipment Tracking Timeline */}
                                {(shipment || isLoadingShipment) && (
                                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Live Tracking</p>
                                                {shipment && <p className="text-xs font-mono text-slate-400">#{shipment.tracking_number}</p>}
                                            </div>
                                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                                <Truck className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>

                                        {isLoadingShipment ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                            </div>
                                        ) : shipment && (
                                            <div className="border-t border-slate-50 pt-4">
                                                <ShipmentTimeline events={shipment.events || []} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons inside scrollable area to avoid scroll on modal */}
                                <div className="pt-2 space-y-3">
                                    {selectedRequest?.status === 'quoted' && (
                                        <Button
                                            className="w-full h-14 rounded-xl bg-primary-orange hover:bg-orange-600 text-white font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-orange-900/10 transition-all active:scale-95 group border-none"
                                            onClick={handleAcceptQuote}
                                            disabled={isAccepting}
                                        >
                                            {isAccepting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-3">
                                                    Accept Quote & Confirm Order <ShieldCheck className="h-4 w-4" />
                                                </span>
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        className="w-full h-14 rounded-xl bg-primary-blue text-white font-semibold uppercase tracking-[0.2em] text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 border-none group"
                                        onClick={() => router.push(`/contact?ref=${selectedRequest?.id}`)}
                                    >
                                        Contact Sourcing Agent <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 rounded-xl font-semibold uppercase tracking-[0.2em] text-[10px] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all border border-slate-100"
                                        onClick={() => setIsQuoteModalOpen(false)}
                                    >
                                        Return to Activity
                                    </Button>
                                </div>
                            </div>

                            {/* Right Column: Feedback/Messaging (Synced Height) */}
                            <div className="lg:w-[500px] bg-white flex flex-col flex-1 lg:h-full overflow-hidden">
                                {selectedRequest && user && (
                                    <FeedbackPanel
                                        requestId={selectedRequest.id}
                                        currentUserId={user.id}
                                        isAgent={false}
                                    />
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </ResponsiveModal>
        </div >
    )
}

function Calendar(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" />
        </svg>
    )
}
