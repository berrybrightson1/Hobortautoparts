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
    Search,
    Filter,
    MoreHorizontal,
    FileText,
    Download,
    Eye,
    Truck
} from "lucide-react"
import { DEMO_ORDERS } from "@/lib/demo-data"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredOrders = DEMO_ORDERS.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vin.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">All Orders</h2>
                    <p className="text-slate-500 font-medium">Manage and track all sourcing requests across the platform.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button className="rounded-xl bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                        <FileText className="mr-2 h-4 w-4" /> New Order
                    </Button>
                </div>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 p-6">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by ID, VIN or Customer..."
                            className="pl-10 h-11 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 bg-white">
                            <Filter className="mr-2 h-4 w-4" /> Filter Status
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider pl-6 h-12">Order ID</TableHead>
                                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider h-12">Customer</TableHead>
                                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider h-12">Vehicle</TableHead>
                                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider h-12">Status</TableHead>
                                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider h-12">Date</TableHead>
                                    <TableHead className="text-right font-bold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                            No orders found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-blue-50/30 transition-colors border-slate-50 group cursor-pointer">
                                            <TableCell className="font-bold text-slate-900 pl-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    {order.id}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                                                        {order.customerName.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-slate-700 group-hover:text-primary-blue transition-colors">{order.customerName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 py-4 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-4 w-4 text-slate-400" />
                                                    {order.vehicleInfo}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className={cn(
                                                    "capitalize rounded-lg px-2.5 py-0.5 font-semibold transition-colors",
                                                    order.status === 'pending' ? "bg-orange-50 text-orange-700 border-orange-100 group-hover:bg-orange-100" :
                                                        order.status === 'quoted' ? "bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-100" :
                                                            order.status === 'delivered' ? "bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-100" :
                                                                "bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-200"
                                                )}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500 py-4 font-medium">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
