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
import { Search, Filter, MoreHorizontal, Truck, Ship, Plane, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { DEMO_ORDERS } from "@/lib/demo-data"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Mock function to simulate updating status
// In a real app, this would be an API call
const updateStatus = (id: string, newStatus: string) => {
    toast.success(`Order ${id} updated to ${newStatus}`)
    // For demo purposes, we can't easily write back to the file on the fly without an API,
    // but the UI will reflect the action.
}

export default function ShipmentManagerPage() {
    const [searchTerm, setSearchTerm] = useState('')
    // Local state to simulate updates for this session
    const [orders, setOrders] = useState(DEMO_ORDERS)

    const handleStatusUpdate = (orderId: string, newStatus: any) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        toast.success(`Order ${orderId} moved to ${newStatus.toUpperCase()}`)
    }

    const filteredOrders = orders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vin.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Shipment Manager</h2>
                    <p className="text-slate-500 font-medium">Update tracking statuses and manage global logistics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900">
                        <Filter className="mr-2 h-4 w-4" /> Filter Views
                    </Button>
                    <Button className="rounded-xl bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                        <Truck className="mr-2 h-4 w-4" /> Create Shipment
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 rounded-3xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-600 font-bold uppercase tracking-wider text-[10px]">In Transit (Air)</CardDescription>
                        <CardTitle className="text-4xl font-black text-blue-900">8</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-blue-600 font-bold bg-blue-100/50 w-fit px-2 py-1 rounded-lg">
                            <Plane className="h-3.5 w-3.5 mr-1.5" />
                            Arriving in 3-5 days
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100 rounded-3xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-orange-600 font-bold uppercase tracking-wider text-[10px]">Pending Customs</CardDescription>
                        <CardTitle className="text-4xl font-black text-orange-900">12</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-orange-600 font-bold bg-orange-100/50 w-fit px-2 py-1 rounded-lg">
                            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                            Action Required
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 rounded-3xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-600 font-bold uppercase tracking-wider text-[10px]">Delivered Today</CardDescription>
                        <CardTitle className="text-4xl font-black text-emerald-900">4</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-emerald-600 font-bold bg-emerald-100/50 w-fit px-2 py-1 rounded-lg">
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            100% On Time
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 bg-white p-6">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search shipments by ID, customer, or VIN..."
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
                                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider pl-6 h-12">Tracking ID</TableHead>
                                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider h-12">Customer</TableHead>
                                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider h-12">Route</TableHead>
                                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider h-12">Status</TableHead>
                                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider h-12">Est. Delivery</TableHead>
                                    <TableHead className="text-right font-bold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-blue-50/30 transition-colors border-slate-50 group cursor-pointer">
                                        <TableCell className="font-bold text-slate-900 pl-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                {order.id}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{order.customerName}</span>
                                                <span className="text-xs font-medium text-slate-400">{order.vehicleInfo}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-full border border-slate-100">
                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                                NJ Hub
                                                <span className="text-slate-300">→</span>
                                                Tema
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="secondary" className={cn(
                                                "capitalize font-bold border-0 px-2 py-0.5 shadow-none",
                                                order.status === 'pending' ? "bg-orange-100 text-orange-700" :
                                                    order.status === 'quoted' ? "bg-blue-100 text-blue-700" :
                                                        order.status === 'shipped' ? "bg-purple-100 text-purple-700" :
                                                            order.status === 'delivered' ? "bg-emerald-100 text-emerald-700" :
                                                                "bg-slate-100 text-slate-700"
                                            )}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs font-medium py-4">
                                            {new Date(new Date(order.createdAt).getTime() + 439200000).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-2 bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl">
                                                    <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Update Status</DropdownMenuLabel>

                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusUpdate(order.id, 'quoted')}
                                                        className="rounded-xl px-3 py-2.5 mb-1 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 text-slate-600 focus:text-blue-700 group transition-colors"
                                                    >
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            <Clock className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <span className="font-medium">Mark Quoted</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                                        className="rounded-xl px-3 py-2.5 mb-1 cursor-pointer hover:bg-purple-50 focus:bg-purple-50 text-slate-600 focus:text-purple-700 group transition-colors"
                                                    >
                                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            <Ship className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        <span className="font-medium">Mark Shipped</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator className="my-1 bg-slate-100" />

                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
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
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
