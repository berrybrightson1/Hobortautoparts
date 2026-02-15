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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, Filter, MoreHorizontal, Plus, Truck, MapPin, Package, Calendar, Loader2, Plane, Ship, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getShipments, createShipment, updateShipmentStatus, searchOrdersForShipment } from "@/app/actions/shipment-actions"

export default function AdminShipmentsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [shipments, setShipments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    // Create Form State
    const [newShipment, setNewShipment] = useState({
        order_id: '',
        tracking_number: '',
        freight_type: 'air',
        origin_hub: 'Georgia Hub',
        destination_hub: 'Accra Pickup',
        estimated_arrival: ''
    })
    const [orderSearchQuery, setOrderSearchQuery] = useState('')
    const [foundOrders, setFoundOrders] = useState<any[]>([])
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isSearchingOrders, setIsSearchingOrders] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        const result = await getShipments()
        if (result.success) {
            setShipments((result.data || []) as any)
        } else {
            toast.error("Failed to load shipments")
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Debounced Order Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (orderSearchQuery.length > 1) {
                setIsSearchingOrders(true)
                const result = await searchOrdersForShipment(orderSearchQuery)
                if (result.success) {
                    setFoundOrders(result.data || [])
                }
                setIsSearchingOrders(false)
            } else {
                setFoundOrders([])
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [orderSearchQuery])

    const handleCreate = async () => {
        if (!selectedOrder || !newShipment.tracking_number) {
            toast.error("Please select an order and enter a tracking number")
            return
        }

        setIsCreating(true)
        const result = await createShipment({
            ...newShipment,
            order_id: selectedOrder.id,
            freight_type: newShipment.freight_type as 'air' | 'sea'
        })

        if (result.success) {
            toast.success("Shipment created successfully")
            setIsCreateOpen(false)
            setNewShipment({
                order_id: '',
                tracking_number: '',
                freight_type: 'air',
                origin_hub: 'Georgia Hub',
                destination_hub: 'Accra Pickup',
                estimated_arrival: ''
            })
            setSelectedOrder(null)
            setOrderSearchQuery('')
            fetchData()
        } else {
            toast.error("Failed to create shipment", { description: result.error })
        }
        setIsCreating(false)
    }

    const handleStatusUpdate = async (id: string, status: any, description: string) => {
        setUpdatingId(id)
        const result = await updateShipmentStatus(id, status, 'Admin Console', description)
        if (result.success) {
            toast.success(`Status updated to ${status.replace(/_/g, ' ')}`)
            fetchData()
        } else {
            toast.error("Update failed", { description: result.error })
        }
        setUpdatingId(null)
    }

    const filteredShipments = shipments.filter(s =>
        s.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.orders?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Global Logistics</h2>
                    <p className="text-slate-500 font-medium">Manage active shipments and tracking updates.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={fetchData}
                        disabled={isLoading}
                        className="h-12 w-12 rounded-xl text-slate-500 hover:text-slate-900"
                    >
                        <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                    </Button>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/10 transition-all font-medium"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create Shipment
                    </Button>
                </div>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 p-6">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by Tracking #, Customer Name..."
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
                                <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider pl-6 h-12">Tracking ID</TableHead>
                                <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Consignee</TableHead>
                                <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Type / Route</TableHead>
                                <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <Loader2 className="h-8 w-8 text-primary-blue animate-spin mx-auto mb-2" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Logistics Data...</p>
                                    </TableCell>
                                </TableRow>
                            ) : filteredShipments.length > 0 ? (
                                filteredShipments.map((shipment) => (
                                    <TableRow key={shipment.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 group">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <Package className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 font-mono">{shipment.tracking_number}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                                        Created {format(new Date(shipment.created_at), 'MMM dd')}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{shipment.orders?.profiles?.full_name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500 font-medium">{shipment.orders?.profiles?.country || 'Global'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    {shipment.freight_type === 'air' ? <Plane className="h-3 w-3 text-sky-500" /> : <Ship className="h-3 w-3 text-blue-600" />}
                                                    <span className="text-xs font-bold text-slate-700 capitalize">{shipment.freight_type} Freight</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium pl-4.5">
                                                    {shipment.destination_hub}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge className={cn(
                                                "rounded-lg px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider border-0 shadow-sm",
                                                shipment.status === 'delivered' ? "bg-emerald-50 text-emerald-600" :
                                                    shipment.status === 'received_at_hub' ? "bg-slate-100 text-slate-600" :
                                                        "bg-blue-50 text-blue-600"
                                            )}>
                                                {shipment.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100" disabled={updatingId === shipment.id}>
                                                        {updatingId === shipment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-slate-100">
                                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1.5">Update Status</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-slate-50" />
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(shipment.id, 'in_transit_air', 'In Transit via Air')} className="text-xs font-bold px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <Plane className="mr-2 h-4 w-4 text-sky-500" /> In Transit (Air)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(shipment.id, 'in_transit_sea', 'In Transit via Sea')} className="text-xs font-bold px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <Ship className="mr-2 h-4 w-4 text-blue-600" /> In Transit (Sea)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(shipment.id, 'clearing_customs', 'Customs Clearance in Progress')} className="text-xs font-bold px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <AlertCircle className="mr-2 h-4 w-4 text-orange-500" /> Customs Clearance
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(shipment.id, 'ready_for_pickup', 'Ready for Pickup at Hub')} className="text-xs font-bold px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <MapPin className="mr-2 h-4 w-4 text-emerald-500" /> Ready for Pickup
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(shipment.id, 'delivered', 'Shipment Delivered to Customer')} className="text-xs font-bold px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Delivered
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <Truck className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-bold text-slate-900">No active shipments</p>
                                                <p className="text-sm text-slate-400 font-medium">Create a shipment to start tracking packages.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Shipment Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-3xl bg-white gap-0">
                    <DialogHeader className="p-6 pb-2 bg-white">
                        <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Create New Shipment</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium text-xs">Link a tracking number to a customer order.</DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-2 space-y-6 bg-white">
                        {/* Order Selector */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Select Order</Label>
                            {!selectedOrder ? (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search Order ID or Customer Name..."
                                            className="pl-9 rounded-xl bg-slate-50 border-slate-200"
                                            value={orderSearchQuery}
                                            onChange={(e) => setOrderSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    {isSearchingOrders && <p className="text-[10px] text-slate-400 px-2">Searching...</p>}
                                    {foundOrders.length > 0 && (
                                        <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100 shadow-lg">
                                            {foundOrders.map(order => (
                                                <button
                                                    key={order.id}
                                                    onClick={() => {
                                                        setSelectedOrder(order)
                                                        setOrderSearchQuery('')
                                                        setFoundOrders([])
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                                                >
                                                    <p className="text-xs font-bold text-slate-900">{order.profiles?.full_name || 'Guest'}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">Order #{order.id.slice(0, 8)} • ${(order.quotes?.total_amount || 0).toFixed(2)}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <div>
                                        <p className="text-xs font-bold text-blue-900">{selectedOrder.profiles?.full_name}</p>
                                        <p className="text-[10px] text-blue-600 font-mono">Order #{selectedOrder.id.slice(0, 8)}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} className="h-6 px-2 text-[10px] hover:bg-blue-100 text-blue-700">Change</Button>
                                </div>
                            )}
                        </div>

                        {/* Tracking Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Tracking Number</Label>
                                <Input
                                    placeholder="TRK-123456789"
                                    className="rounded-xl bg-slate-50 border-slate-200 font-mono text-sm"
                                    value={newShipment.tracking_number}
                                    onChange={(e) => setNewShipment({ ...newShipment, tracking_number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Freight Type</Label>
                                <Select
                                    value={newShipment.freight_type}
                                    onValueChange={(val) => setNewShipment({ ...newShipment, freight_type: val })}
                                >
                                    <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="air">Air Freight</SelectItem>
                                        <SelectItem value="sea">Sea Freight</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Origin Hub</Label>
                                <Input
                                    className="rounded-xl bg-slate-50 border-slate-200"
                                    value={newShipment.origin_hub}
                                    onChange={(e) => setNewShipment({ ...newShipment, origin_hub: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Destination Hub</Label>
                                <Input
                                    className="rounded-xl bg-slate-50 border-slate-200"
                                    value={newShipment.destination_hub}
                                    onChange={(e) => setNewShipment({ ...newShipment, destination_hub: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Estimated Arrival</Label>
                            <Input
                                type="date"
                                className="rounded-xl bg-slate-50 border-slate-200"
                                value={newShipment.estimated_arrival}
                                onChange={(e) => setNewShipment({ ...newShipment, estimated_arrival: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-6 pt-2 bg-white">
                        <Button
                            onClick={handleCreate}
                            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-bold shadow-lg disabled:opacity-50"
                            disabled={isCreating || !selectedOrder || !newShipment.tracking_number}
                        >
                            {isCreating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Truck className="h-5 w-5 mr-2" />}
                            Initialize Shipment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
