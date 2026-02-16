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
import { Search, Filter, MoreHorizontal, Package, CheckCircle2, Clock, AlertCircle, Inbox, Loader2, ArrowRight, DollarSign, Calculator, Info, Users, Truck, RefreshCw, Copy as CopyIcon, X, MessageSquare } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { useSearchParams } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { sendNotificationAction, notifyAdminsAction } from "@/app/actions/notification-actions"
import { FeedbackPanel } from "@/components/portal/feedback-panel"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { Activity } from "lucide-react"
import { SearchBar } from "@/components/portal/search-bar"
import { Pagination } from "@/components/portal/pagination"

interface SourcingRequest {
    id: string
    user_id: string
    agent_id: string | null
    vin: string | null
    part_name: string
    vehicle_info: string | null
    status: 'pending' | 'processing' | 'quoted' | 'shipped' | 'completed' | 'cancelled' | 'unavailable'
    part_condition?: string
    created_at: string
    profiles?: {
        full_name: string | null
    }
    quotes?: any[]
}

export default function SourcingRequestsPage() {
    const { user, profile } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const requestIdParam = searchParams.get('id')
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [requests, setRequests] = useState<SourcingRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [isAcceptingProxy, setIsAcceptingProxy] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(20)
    const totalCount = requests.length

    // Quote Modal State
    const [selectedRequest, setSelectedRequest] = useState<SourcingRequest | null>(null)
    const [showQuoteModal, setShowQuoteModal] = useState(false)
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false)
    const [quoteData, setQuoteData] = useState({
        item_price: '',
        shipping_cost: '',
        service_fee: '0.00', // Default to 0
        notes: ''
    })

    const totalAmount = useMemo(() => {
        const p = parseFloat(quoteData.item_price) || 0
        const s = parseFloat(quoteData.shipping_cost) || 0
        const f = parseFloat(quoteData.service_fee) || 0
        return (p + s + f).toFixed(2)
    }, [quoteData])

    const [agents, setAgents] = useState<any[]>([])

    const fetchRequests = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('sourcing_requests')
                .select(`
                    *,
                    quotes (
                        *,
                        orders (id, status)
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setRequests(data || [])

            // Fetch active agents for assignment
            const { data: agentsData } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'agent')

            setAgents(agentsData || [])
        } catch (error: any) {
            toast.error("Failed to fetch requests", {
                description: error.message
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    useEffect(() => {
        if (requestIdParam && requests.length > 0) {
            const request = requests.find(r => r.id === requestIdParam)
            if (request) {
                setSelectedRequest(request)
                setIsDetailsOpen(true)
            }
        }
    }, [requestIdParam, requests])

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Filter and paginate requests
    const filteredRequests = requests.filter((request) => {
        const filterType = searchParams.get('filter')
        const matchesFilter = filterType === 'unassigned' ? (request.agent_id === null && request.status === 'pending') : true

        if (!debouncedSearch) return matchesFilter

        const searchLower = debouncedSearch.toLowerCase()
        const matchesSearch = (
            request.part_name?.toLowerCase().includes(searchLower) ||
            request.vehicle_info?.toLowerCase().includes(searchLower) ||
            request.vin?.toLowerCase().includes(searchLower) ||
            request.profiles?.full_name?.toLowerCase().includes(searchLower) ||
            request.id?.toLowerCase().includes(searchLower)
        )

        return matchesFilter && matchesSearch
    })

    const totalPages = Math.ceil(filteredRequests.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + pageSize)


    const handleAssignment = async (requestId: string, agentId: string) => {
        setUpdatingId(requestId)
        try {
            const { error } = await supabase
                .from('sourcing_requests')
                .update({ agent_id: agentId, status: 'processing' })
                .eq('id', requestId)

            if (error) throw error

            // Notify the assigned agent
            await sendNotificationAction({
                userId: agentId,
                title: 'New Request Allocated',
                message: `You have been assigned a new sourcing request: ${requests.find(r => r.id === requestId)?.part_name || 'Unidentified Part'}.`,
                type: 'request' // Use literal string if type error persists, or ensure type definition match
            })

            toast.success("Agent assigned successfully")
            fetchRequests()
        } catch (error: any) {
            toast.error("Assignment failed", { description: error.message })
        } finally {
            setUpdatingId(null)
        }
    }

    const handleStatusUpdate = async (requestId: string, newStatus: SourcingRequest['status']) => {
        setUpdatingId(requestId)
        try {
            const { error } = await supabase
                .from('sourcing_requests')
                .update({ status: newStatus })
                .eq('id', requestId)

            if (error) throw error

            // Notify the customer
            const request = requests.find(r => r.id === requestId)
            if (request) {
                await sendNotificationAction({
                    userId: request.user_id,
                    title: 'Request Status Updated',
                    message: `The status of your request for "${request.part_name}" has been updated to ${newStatus.toUpperCase()}.`,
                    type: 'request'
                })
            }

            toast.success(`Request status updated to ${newStatus.toUpperCase()}`)
            fetchRequests()
        } catch (error: any) {
            toast.error("Failed to update status", {
                description: error.message
            })
        } finally {
            setUpdatingId(null)
        }
    }

    const handleAcceptOnBehalf = async () => {
        if (!selectedRequest || !selectedRequest.quotes?.[0] || !user) return

        setIsAcceptingProxy(true)
        const quote = selectedRequest.quotes[0]

        try {
            const { createProxyOrder } = await import('@/app/actions/admin-actions')
            const res = await createProxyOrder(
                selectedRequest.id,
                quote.id,
                selectedRequest.user_id,
                selectedRequest.agent_id
            )

            if (res.success) {
                toast.success("Order Confirmed on Customer's Behalf", {
                    description: "You have verified and accepted this quote for the client manually."
                })
                setIsDetailsOpen(false)
                fetchRequests()
            } else {
                throw new Error(res.error)
            }
        } catch (error: any) {
            console.error("Admin proxy acceptance error:", error)
            toast.error("Proxy Action Failed", { description: error.message || "A database error occurred." })
        } finally {
            setIsAcceptingProxy(false)
        }
    }

    const openQuoteModal = (request: SourcingRequest) => {
        setSelectedRequest(request)
        setShowQuoteModal(true)
    }

    const handleSubmitQuote = async () => {
        if (!selectedRequest || !user) return
        if (!quoteData.item_price || !quoteData.shipping_cost) {
            toast.error("Please fill in price and shipping details")
            return
        }

        setIsSubmittingQuote(true)

        // Hard timeout to prevent "loading forever" UI
        const timeoutId = setTimeout(() => {
            if (isSubmittingQuote) {
                setIsSubmittingQuote(false)
                toast.error("Low Network or Database Latency", {
                    description: "The request is taking longer than expected. Please check your connection and try again."
                })
            }
        }, 30000)

        try {
            console.log('--- STARTING QUOTE SUBMISSION ---')
            // 1. Create the quote
            const { data: quote, error: quoteError } = await supabase
                .from('quotes')
                .insert({
                    request_id: selectedRequest.id,
                    admin_id: user.id,
                    item_price: parseFloat(quoteData.item_price),
                    shipping_cost: parseFloat(quoteData.shipping_cost),
                    service_fee: parseFloat(quoteData.service_fee),
                    total_amount: parseFloat(totalAmount),
                    currency: 'USD',
                    notes: quoteData.notes
                })
                .select()
                .single()

            if (quoteError) throw quoteError
            console.log('--- QUOTE CREATED ---')

            // 2. Update the request status
            const { error: requestError } = await supabase
                .from('sourcing_requests')
                .update({ status: 'quoted' })
                .eq('id', selectedRequest.id)

            if (requestError) throw requestError
            console.log('--- REQUEST UPDATED ---')

            // Notify the customer of the new quote
            try {
                await sendNotificationAction({
                    userId: selectedRequest.user_id,
                    title: 'New Quote Available',
                    message: `An official quote has been generated for your request: ${selectedRequest.part_name}.`,
                    type: 'order'
                })

                // Relay to all Admins
                await notifyAdminsAction({
                    title: 'Quote Sent to Customer',
                    message: `A new quote has been generated for ${selectedRequest.part_name} by ${profile?.full_name || 'an Agent'}.`,
                    type: 'order'
                })
                console.log('--- NOTIFICATIONS SENT ---')
            } catch (notifyErr) {
                console.warn('Non-blocking notification failure:', notifyErr)
            }

            toast.success("Quote generated successfully!", {
                description: "The customer will be notified of the new quote."
            })
            setShowQuoteModal(false)
            fetchRequests()

        } catch (error: any) {
            console.error('Quote submission fatal error:', error)
            toast.error("Failed to generate quote", {
                description: error.message || "A database error occurred."
            })
        } finally {
            clearTimeout(timeoutId)
            setIsSubmittingQuote(false)
        }
    }


    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Sourcing Requests</h2>
                    <p className="text-slate-500 font-medium">Manage and respond to part sourcing requests from customers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900"
                        onClick={fetchRequests}
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Refresh
                    </Button>
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900" disabled={requests.length === 0}>
                        <Filter className="mr-2 h-4 w-4" /> Export Requests
                    </Button>
                </div>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 bg-white p-6">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search by part, vehicle, customer, or VIN..."
                        className="flex-1 md:max-w-md"
                    />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider pl-6 h-12">Date</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Customer</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Part / Vehicle</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Messages</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="h-8 w-8 text-primary-blue animate-spin" />
                                                <p className="text-sm font-medium text-slate-500">Loading requests...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedRequests.length > 0 ? (
                                    paginatedRequests.map((request) => (
                                        <TableRow key={request.id} className="hover:bg-blue-50/30 transition-colors border-slate-50 group cursor-pointer">
                                            <TableCell className="text-slate-500 text-xs font-medium pl-6 py-4">
                                                {format(new Date(request.created_at), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">{request.profiles?.full_name || 'Anonymous'}</span>
                                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{request.vin || 'NO VIN'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">{request.part_name}</span>
                                                    <span className="text-xs text-slate-500">{request.vehicle_info || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className={cn(
                                                    "capitalize font-semibold border-0 px-2 py-0.5 shadow-none",
                                                    request.status === 'pending' ? "bg-orange-100 text-orange-700" :
                                                        request.status === 'processing' ? "bg-blue-100 text-blue-700" :
                                                            request.status === 'quoted' ? "bg-indigo-100 text-indigo-700" :
                                                                request.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                                                                    "bg-slate-100 text-slate-700"
                                                )}>
                                                    {request.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedRequest(request)
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
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" disabled={updatingId === request.id}>
                                                            {updatingId === request.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 p-2 bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedRequest(request)
                                                                setIsDetailsOpen(true)
                                                            }}
                                                            className="rounded-xl px-3 py-2.5 mb-1 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 text-slate-600 focus:text-blue-700 group transition-colors"
                                                        >
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                <Info className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <span className="font-medium">Manage Request</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator className="my-1 bg-slate-100" />

                                                        <DropdownMenuLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Update Status</DropdownMenuLabel>

                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusUpdate(request.id, 'processing')}
                                                            className="rounded-xl px-3 py-2.5 mb-1 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 text-slate-600 focus:text-blue-700 group transition-colors"
                                                        >
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                <Clock className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <span className="font-medium">Mark Processing</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusUpdate(request.id, 'quoted')}
                                                            className="rounded-xl px-3 py-2.5 mb-1 cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 text-slate-600 focus:text-indigo-700 group transition-colors"
                                                        >
                                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                                                            </div>
                                                            <span className="font-medium">Mark Quoted</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator className="my-1 bg-slate-100" />

                                                        <DropdownMenuLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Allocation</DropdownMenuLabel>
                                                        {agents.map(agent => (
                                                            <DropdownMenuItem
                                                                key={agent.id}
                                                                onClick={() => handleAssignment(request.id, agent.id)}
                                                                className="rounded-xl px-3 py-2.5 mb-1 cursor-pointer hover:bg-slate-50 text-slate-600 focus:text-primary-blue group transition-colors"
                                                            >
                                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                    <Users className="h-4 w-4 text-slate-400" />
                                                                </div>
                                                                <span className="font-medium">Assign to {agent.full_name.split(' ')[0]}</span>
                                                            </DropdownMenuItem>
                                                        ))}

                                                        <DropdownMenuSeparator className="my-1 bg-slate-100" />

                                                        <DropdownMenuItem
                                                            onClick={() => openQuoteModal(request)}
                                                            className="rounded-xl px-3 py-2.5 mb-1 cursor-pointer hover:bg-orange-50 focus:bg-orange-50 text-slate-600 focus:text-orange-700 group transition-colors"
                                                        >
                                                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                <ArrowRight className="h-4 w-4 text-orange-600" />
                                                            </div>
                                                            <span className="font-medium">Create Quote</span>
                                                        </DropdownMenuItem>

                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 py-10">
                                            <div className="flex flex-col items-center justify-center text-center gap-4">
                                                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <Inbox className="h-8 w-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-semibold text-slate-900">No requests found</p>
                                                    <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                                                        {searchTerm ? 'Try adjusting your search terms.' : 'New sourcing requests will appear here.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredRequests.length > pageSize && (
                        <div className="p-4 border-t border-slate-50 bg-white">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalCount={filteredRequests.length}
                                pageSize={pageSize}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Manage Request Modal */}
            <ResponsiveModal
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                title="Manage Sourcing Request"
                description={`Request ID: ${selectedRequest?.id.slice(0, 8)}`}
                size="xl"
            >
                <div className="w-full bg-white p-1">
                    {/* Body - 2 Column Layout */}
                    <div className="flex-1">
                        <div className="flex flex-col lg:flex-row">

                            {/* Left Column: Details (Scrollable) */}
                            {/* Left Column: Details (Scrollable) */}
                            <div className="flex-1 p-8 space-y-6 bg-white lg:border-r border-slate-100">
                                {/* Header / Status Section */}
                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Request Status</p>
                                            <Badge className={cn("px-3 py-1 rounded-lg font-semibold uppercase tracking-[0.15em] text-[10px] border-none shadow-sm",
                                                selectedRequest?.status === 'pending' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                                            )}>
                                                {selectedRequest?.status}
                                            </Badge>
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                                            <Activity className="h-5 w-5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Item Info Section */}
                                <div className="p-6 bg-slate-50/30 rounded-3xl border border-slate-100/50 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Part Description</p>
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 bg-white rounded-2xl border border-slate-100/50 space-y-2 shadow-sm">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">Vehicle Specification</p>
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">{selectedRequest?.vehicle_info}</p>
                                        </div>
                                        <div className="p-5 bg-white rounded-2xl border border-slate-100/50 space-y-2 shadow-sm">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">VIN Number</p>
                                            <div className="h-10 flex items-center px-4 bg-slate-950 rounded-lg shadow-xl">
                                                <p className="font-mono font-medium text-white tracking-[0.1em] text-[10px]">{selectedRequest?.vin || 'NOT PROVIDED'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Requester Identity */}
                                <div className="p-6 bg-blue-50/20 rounded-3xl border border-blue-100/50 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-primary-blue font-semibold text-[10px] shadow-sm">
                                            {selectedRequest?.profiles?.full_name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-500">Requester Identity</p>
                                            <p className="font-semibold text-slate-900 text-lg tracking-tight">{selectedRequest?.profiles?.full_name}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons inside scrollable area */}
                                    <div className="pt-2 space-y-3">
                                        {/* Issue Quotation Button - Only if not quoted/completed */}
                                        {!['quoted', 'shipped', 'completed', 'cancelled', 'unavailable'].includes(selectedRequest?.status || '') && (
                                            <Button
                                                className="w-full h-14 rounded-xl bg-primary-blue hover:bg-blue-700 text-white font-semibold uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95 group border-none"
                                                onClick={() => {
                                                    setIsDetailsOpen(false)
                                                    try {
                                                        openQuoteModal(selectedRequest!)
                                                    } catch (e) {
                                                        console.error("Failed to open quote modal", e)
                                                    }
                                                }}
                                            >
                                                <span className="flex items-center gap-3">
                                                    Issue Quotation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </span>
                                            </Button>
                                        )}
                                        {/* Proxy Acceptance Button - Only if status is 'quoted' AND no order exists */}
                                        {selectedRequest?.status === 'quoted' && (
                                            <>
                                                {selectedRequest.quotes?.[0]?.orders?.length > 0 ? (
                                                    <div className="w-full h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center gap-2 text-slate-500 font-semibold uppercase tracking-[0.2em] text-[10px]">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        Order Already Created
                                                    </div>
                                                ) : (
                                                    <Button
                                                        className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-500/20 transition-all active:scale-95 group border-none"
                                                        onClick={handleAcceptOnBehalf}
                                                        disabled={isAcceptingProxy}
                                                    >
                                                        {isAcceptingProxy ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <span className="flex items-center gap-3">
                                                                Accept on Customer's Behalf <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                                            </span>
                                                        )}
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                        <Button
                                            variant="ghost"
                                            className="w-full h-12 rounded-xl font-semibold uppercase tracking-[0.2em] text-[10px] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all border border-slate-100"
                                            onClick={() => setIsDetailsOpen(false)}
                                        >
                                            Return to Requests
                                        </Button>

                                        {/* Mark Unavailable Button */}
                                        {['pending', 'processing'].includes(selectedRequest?.status || '') && (
                                            <Button
                                                variant="ghost"
                                                className="w-full h-12 rounded-xl font-semibold uppercase tracking-[0.2em] text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 transition-all border border-red-50"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to mark this request as Unavailable? This will notify the customer.")) {
                                                        handleStatusUpdate(selectedRequest!.id, 'unavailable')
                                                        setIsDetailsOpen(false)
                                                    }
                                                }}
                                            >
                                                Mark as Unavailable
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Feedback/Messaging (Synced Height) */}
                            <div className="lg:w-[500px] bg-white flex flex-col flex-1 lg:h-full overflow-hidden">
                                {selectedRequest && user && (
                                    <FeedbackPanel
                                        requestId={selectedRequest.id}
                                        currentUserId={user.id}
                                        isAgent={true}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ResponsiveModal>

            {/* Quote Builder Modal */}
            <ResponsiveModal
                open={showQuoteModal}
                onOpenChange={setShowQuoteModal}
                title="Generate Quote"
                description={`Ref: ${selectedRequest?.id.slice(0, 8)}`}
            >
                <div className="flex flex-col w-full max-w-lg mx-auto bg-white overflow-hidden rounded-3xl">
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Item Price ($)</Label>
                                <Input
                                    type="number"
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold"
                                    value={quoteData.item_price}
                                    onChange={(e) => setQuoteData({ ...quoteData, item_price: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Logistics ($)</Label>
                                <Input
                                    type="number"
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold"
                                    value={quoteData.shipping_cost}
                                    onChange={(e) => setQuoteData({ ...quoteData, shipping_cost: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border-2 border-blue-100 flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-600">Total Quote Amount</span>
                            <span className="text-3xl font-black tracking-tighter text-slate-900">${totalAmount}</span>
                        </div>
                    </div>

                    <div className="p-8 border-t border-slate-100 flex gap-3">
                        <Button variant="ghost" className="flex-1 h-14 rounded-xl font-bold uppercase tracking-widest text-xs" onClick={() => setShowQuoteModal(false)}>Cancel</Button>
                        <Button className="flex-1 h-14 rounded-xl bg-primary-blue hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20" onClick={handleSubmitQuote} disabled={isSubmittingQuote}>
                            {isSubmittingQuote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dispatch Quote"}
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>
        </div>
    )
}
