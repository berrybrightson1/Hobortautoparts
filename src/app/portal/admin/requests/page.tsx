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
import { Search, Filter, MoreHorizontal, Package, CheckCircle2, Clock, AlertCircle, Inbox, Loader2, ArrowRight, DollarSign, Calculator, Info, Users, Truck } from "lucide-react"
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

interface SourcingRequest {
    id: string
    user_id: string
    vin: string | null
    part_name: string
    vehicle_info: string | null
    status: 'pending' | 'processing' | 'quoted' | 'shipped' | 'completed' | 'cancelled'
    created_at: string
    profiles?: {
        full_name: string | null
    }
}

export default function SourcingRequestsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [requests, setRequests] = useState<SourcingRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    // Quote Modal State
    const [selectedRequest, setSelectedRequest] = useState<SourcingRequest | null>(null)
    const [showQuoteModal, setShowQuoteModal] = useState(false)
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false)
    const [quoteData, setQuoteData] = useState({
        item_price: '',
        shipping_cost: '',
        service_fee: '25.00', // Default service fee
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
                    profiles (
                        full_name
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

    const handleAssignment = async (requestId: string, agentId: string) => {
        setUpdatingId(requestId)
        try {
            const { error } = await supabase
                .from('sourcing_requests')
                .update({ agent_id: agentId, status: 'processing' })
                .eq('id', requestId)

            if (error) throw error
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
        try {
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

            // 2. Update the request status
            const { error: requestError } = await supabase
                .from('sourcing_requests')
                .update({ status: 'quoted' })
                .eq('id', selectedRequest.id)

            if (requestError) throw requestError

            toast.success("Quote generated successfully!", {
                description: "The customer will be notified of the new quote."
            })
            setShowQuoteModal(false)
            fetchRequests()

            // Trigger a simulated notification logic here if needed
            // (Database triggers typically handle actual notifications)

        } catch (error: any) {
            console.error('Quote submission error:', error)
            toast.error("Failed to generate quote", {
                description: error.message
            })
        } finally {
            setIsSubmittingQuote(false)
        }
    }

    const filteredRequests = requests.filter(request =>
        request.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.vehicle_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.vin?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Sourcing Requests</h2>
                    <p className="text-slate-500 font-medium">Manage and respond to part sourcing requests from customers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900" disabled={requests.length === 0}>
                        <Filter className="mr-2 h-4 w-4" /> Export Requests
                    </Button>
                </div>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 bg-white p-6">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search requests by part, vehicle, or customer..."
                            className="pl-10 h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                                ) : filteredRequests.length > 0 ? (
                                    filteredRequests.map((request) => (
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
                </CardContent>
            </Card>

            {/* Quote Builder Modal */}
            <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl rounded-[3rem] bg-white text-slate-900">
                    <DialogHeader className="p-10 pt-12 text-left bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
                                <DollarSign className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-3xl font-black uppercase tracking-tighter leading-none text-slate-900">Issue Quote</DialogTitle>
                                <DialogDescription className="text-slate-500 font-bold text-sm italic">
                                    Finalizing financial breakdown for <span className="text-primary-blue font-bold italic">"{selectedRequest?.part_name}"</span>.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-10 space-y-8">
                        {/* Request Summary Card */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Entity</span>
                                <Badge variant="outline" className="rounded-full bg-white text-slate-900 border-slate-200 px-4 py-1 font-bold">
                                    {selectedRequest?.profiles?.full_name || 'Anonymous'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicle Instance</span>
                                <span className="text-xs font-bold text-slate-600 tracking-tight">{selectedRequest?.vehicle_info || 'Global Sync'}</span>
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Net Price ($)</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-blue transition-colors">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="h-16 pl-12 rounded-[1.25rem] border-slate-100 bg-slate-50 focus:bg-white focus:ring-8 focus:ring-blue-500/10 transition-all font-bold text-xl"
                                        value={quoteData.item_price}
                                        onChange={(e) => setQuoteData({ ...quoteData, item_price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Logistics ($)</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-blue transition-colors">
                                        <Truck className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="h-16 pl-12 rounded-[1.25rem] border-slate-100 bg-slate-50 focus:bg-white focus:ring-8 focus:ring-blue-500/10 transition-all font-bold text-xl"
                                        value={quoteData.shipping_cost}
                                        onChange={(e) => setQuoteData({ ...quoteData, shipping_cost: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-1">
                                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform / Service Fee ($)</Label>
                                <Badge className="bg-blue-50 text-primary-blue border-blue-100 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                                    Standard Rate
                                </Badge>
                            </div>
                            <Input
                                type="number"
                                className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50/50 text-slate-400 transition-all font-bold text-xl cursor-not-allowed opacity-60 px-6"
                                value={quoteData.service_fee}
                                disabled
                            />
                        </div>

                        {/* Total Highlight - Premium Card */}
                        <div className="relative group mt-4">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-blue to-indigo-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                            <div className="relative bg-[#0c1425] rounded-[2rem] p-8 flex items-center justify-between overflow-hidden shadow-2xl">
                                <div className="space-y-2 relative z-10">
                                    <p className="text-[10px] font-black text-blue-300/60 uppercase tracking-[0.3em]">Aggregate Total (USD)</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-white tracking-tighter">
                                            ${totalAmount}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-20 w-20 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:bg-primary-blue group-hover:border-primary-blue/50 transition-all duration-500 shadow-xl relative z-10">
                                    <ArrowRight className="h-8 w-8" />
                                </div>

                                {/* Subtle Gradient Glow */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="p-10 pt-4 pb-12 grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="h-16 rounded-[1.5rem] border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:text-slate-900 transition-all"
                            onClick={() => setShowQuoteModal(false)}
                        >
                            Abort Process
                        </Button>
                        <Button
                            className="h-16 rounded-[1.5rem] bg-[#0c1425] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 transition-all active:scale-95 border-0"
                            onClick={handleSubmitQuote}
                            disabled={isSubmittingQuote || !quoteData.item_price || !quoteData.shipping_cost}
                        >
                            {isSubmittingQuote ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                "Confirm Deployment"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
