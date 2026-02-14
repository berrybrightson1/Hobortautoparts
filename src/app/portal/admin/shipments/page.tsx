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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Filter, MoreHorizontal, Truck, Ship, Plane, CheckCircle, Clock, AlertCircle, Inbox, Plus, Loader2, ArrowRight, Info, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

interface Shipment {
    id: string
    order_id: string
    tracking_number: string
    carrier: string
    status: 'pending' | 'in_transit' | 'customs' | 'delivered'
    origin: string
    destination: string
    estimated_delivery: string
    actual_delivery?: string
    created_at: string
    orders?: {
        profiles?: {
            full_name: string | null
        }
        vehicle_info?: string
    }
}

export default function ShipmentManagerPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    // New shipment form
    const [newShipment, setNewShipment] = useState({
        tracking_number: '',
        carrier: '',
        origin: '',
        destination: '',
        estimated_delivery: ''
    })

    const fetchShipments = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('shipments')
                .select(`
                    *,
                    orders (
                        vehicle_info,
                        profiles (
                            full_name
                        )
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setShipments(data || [])
        } catch (error: any) {
            toast.error("Failed to fetch shipments", {
                description: error.message
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchShipments()
    }, [])

    const handleStatusUpdate = async (shipmentId: string, newStatus: Shipment['status']) => {
        setUpdatingId(shipmentId)
        try {
            const updateData: any = { status: newStatus }

            // If marking as delivered, set actual delivery date
            if (newStatus === 'delivered') {
                updateData.actual_delivery = new Date().toISOString()
            }

            const { error } = await supabase
                .from('shipments')
                .update(updateData)
                .eq('id', shipmentId)

            if (error) throw error

            toast.success(`Shipment status updated to ${newStatus.toUpperCase()}`)
            fetchShipments()
        } catch (error: any) {
            toast.error("Failed to update status", {
                description: error.message
            })
        } finally {
            setUpdatingId(null)
        }
    }

    const handleCreateShipment = async () => {
        if (!newShipment.tracking_number || !newShipment.carrier) {
            toast.error("Please fill in required fields")
            return
        }

        setIsCreating(true)
        try {
            const { error } = await supabase
                .from('shipments')
                .insert({
                    ...newShipment,
                    status: 'pending'
                })

            if (error) throw error

            toast.success("Shipment created successfully!")
            setShowCreateDialog(false)
            setNewShipment({
                tracking_number: '',
                carrier: '',
                origin: '',
                destination: '',
                estimated_delivery: ''
            })
            fetchShipments()
        } catch (error: any) {
            toast.error("Failed to create shipment", {
                description: error.message
            })
        } finally {
            setIsCreating(false)
        }
    }

    const filteredShipments = shipments.filter(shipment =>
        shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.carrier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.orders?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate stats
    const stats = {
        inTransit: shipments.filter(s => s.status === 'in_transit').length,
        customs: shipments.filter(s => s.status === 'customs').length,
        delivered: shipments.filter(s => s.status === 'delivered' &&
            new Date(s.actual_delivery || '').toDateString() === new Date().toDateString()).length
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Shipment Manager</h2>
                    <p className="text-slate-500 font-medium">Update tracking statuses and manage global logistics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900" disabled={shipments.length === 0}>
                        <Filter className="mr-2 h-4 w-4" /> Filter Views
                    </Button>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                                <Plus className="mr-2 h-4 w-4" /> Create Shipment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl rounded-[2.5rem] bg-white">
                            <DialogHeader className="p-8 pb-0">
                                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 group flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    Initiate New Shipment
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 font-medium pt-2">
                                    Register a new logistics instance for global tracking.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="p-8 pt-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tracking" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tracking ID</Label>
                                        <div className="relative group">
                                            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
                                            <Input
                                                id="tracking"
                                                value={newShipment.tracking_number}
                                                onChange={(e) => setNewShipment({ ...newShipment, tracking_number: e.target.value })}
                                                placeholder="TRK-123456"
                                                className="h-12 pl-10 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-semibold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="carrier" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Logistics Carrier</Label>
                                        <div className="relative group">
                                            <Ship className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
                                            <Input
                                                id="carrier"
                                                value={newShipment.carrier}
                                                onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })}
                                                placeholder="DHL / FedEx / UPS"
                                                className="h-12 pl-10 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-semibold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 relative">
                                    {/* Link Visual */}
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 hidden sm:block">
                                        <ArrowRight className="h-4 w-4 text-slate-200" />
                                    </div>

                                    <div className="space-y-2 relative z-10">
                                        <Label htmlFor="origin" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Origin Hub</Label>
                                        <Input
                                            id="origin"
                                            value={newShipment.origin}
                                            onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                                            placeholder="E.g. Dubai, UAE"
                                            className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 relative z-10">
                                        <Label htmlFor="destination" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Destination Hub</Label>
                                        <Input
                                            id="destination"
                                            value={newShipment.destination}
                                            onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                                            placeholder="E.g. Accra, Ghana"
                                            className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-medium text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="eta" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Estimated Arrival (ETA)</Label>
                                    <div className="relative group">
                                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
                                        <Input
                                            id="eta"
                                            type="date"
                                            value={newShipment.estimated_delivery}
                                            onChange={(e) => setNewShipment({ ...newShipment, estimated_delivery: e.target.value })}
                                            className="h-12 pl-10 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 rounded-3xl p-4 border border-dashed border-slate-200 flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <Info className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                                        Initializing a shipment will automatically notify the customer and provide them with a tracking link in their portal. Please ensure the <span className="text-slate-900 font-bold">Tracking ID</span> is accurate.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="p-8 pt-0 gap-3 sm:gap-0">
                                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50" onClick={() => setShowCreateDialog(false)}>
                                    Discard Entry
                                </Button>
                                <Button onClick={handleCreateShipment} disabled={isCreating} className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary-blue to-blue-700 text-white font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    {isCreating ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        "Commit Shipment"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 rounded-3xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-600 font-semibold uppercase tracking-wider text-[10px]">In Transit (Air)</CardDescription>
                        <CardTitle className="text-4xl font-semibold text-blue-900">{stats.inTransit}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-blue-400 font-semibold bg-blue-50 w-fit px-2 py-1 rounded-lg">
                            <Plane className="h-3.5 w-3.5 mr-1.5" />
                            {stats.inTransit === 0 ? 'No active air freights' : `${stats.inTransit} active shipment${stats.inTransit > 1 ? 's' : ''}`}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100 rounded-3xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-orange-600 font-semibold uppercase tracking-wider text-[10px]">Pending Customs</CardDescription>
                        <CardTitle className="text-4xl font-semibold text-orange-900">{stats.customs}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-orange-400 font-semibold bg-orange-50 w-fit px-2 py-1 rounded-lg">
                            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                            {stats.customs === 0 ? 'Clearance queue empty' : `${stats.customs} awaiting clearance`}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 rounded-3xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-600 font-semibold uppercase tracking-wider text-[10px]">Delivered Today</CardDescription>
                        <CardTitle className="text-4xl font-semibold text-emerald-900">{stats.delivered}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-emerald-400 font-semibold bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            {stats.delivered === 0 ? 'Awaiting daily log' : `${stats.delivered} delivered today`}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 bg-white p-6">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search shipments by tracking, carrier, or customer profile..."
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
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider pl-6 h-12">Tracking ID</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Carrier</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Route</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Est. Delivery</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="h-8 w-8 text-primary-blue animate-spin" />
                                                <p className="text-sm font-medium text-slate-500">Loading shipments...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredShipments.length > 0 ? (
                                    filteredShipments.map((shipment) => (
                                        <TableRow key={shipment.id} className="hover:bg-blue-50/30 transition-colors border-slate-50 group cursor-pointer">
                                            <TableCell className="font-semibold text-slate-900 pl-6 py-4">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {shipment.tracking_number}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">{shipment.carrier}</span>
                                                    <span className="text-xs font-medium text-slate-400">{shipment.orders?.profiles?.full_name || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-full border border-slate-100">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                                    {shipment.origin || 'N/A'}
                                                    <span className="text-slate-300">→</span>
                                                    {shipment.destination || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className={cn(
                                                    "capitalize font-semibold border-0 px-2 py-0.5 shadow-none",
                                                    shipment.status === 'pending' ? "bg-orange-100 text-orange-700" :
                                                        shipment.status === 'in_transit' ? "bg-blue-100 text-blue-700" :
                                                            shipment.status === 'customs' ? "bg-purple-100 text-purple-700" :
                                                                shipment.status === 'delivered' ? "bg-emerald-100 text-emerald-700" :
                                                                    "bg-slate-100 text-slate-700"
                                                )}>
                                                    {shipment.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-xs font-medium py-4">
                                                {shipment.estimated_delivery ? format(new Date(shipment.estimated_delivery), 'MMM dd, yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" disabled={updatingId === shipment.id}>
                                                            {updatingId === shipment.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 p-2 bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl">
                                                        <DropdownMenuLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Update Status</DropdownMenuLabel>

                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusUpdate(shipment.id, 'in_transit')}
                                                            className="rounded-xl px-3 py-2.5 mb-1 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 text-slate-600 focus:text-blue-700 group transition-colors"
                                                        >
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                <Plane className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <span className="font-medium">Mark In Transit</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusUpdate(shipment.id, 'customs')}
                                                            className="rounded-xl px-3 py-2.5 mb-1 cursor-pointer hover:bg-purple-50 focus:bg-purple-50 text-slate-600 focus:text-purple-700 group transition-colors"
                                                        >
                                                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                <AlertCircle className="h-4 w-4 text-purple-600" />
                                                            </div>
                                                            <span className="font-medium">Mark At Customs</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator className="my-1 bg-slate-100" />

                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusUpdate(shipment.id, 'delivered')}
                                                            className="rounded-xl px-3 py-2.5 cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 text-slate-600 focus:text-emerald-700 group transition-colors"
                                                        >
                                                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                            </div>
                                                            <span className="font-medium">Mark Delivered</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 py-10">
                                            <div className="flex flex-col items-center justify-center text-center gap-4">
                                                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <Inbox className="h-8 w-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-semibold text-slate-900">No shipments found</p>
                                                    <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                                                        {searchTerm ? 'Try adjusting your search terms.' : 'Create your first shipment to start tracking.'}
                                                    </p>
                                                </div>
                                                {!searchTerm && (
                                                    <Button size="sm" variant="outline" className="rounded-xl border-slate-200 mt-2" onClick={() => setShowCreateDialog(true)}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Create Shipment
                                                    </Button>
                                                )}
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
