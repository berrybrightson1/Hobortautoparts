"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Users,
    ShoppingCart,
    Activity,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreHorizontal,
    FileText,
    Truck
} from "lucide-react"
import { DEMO_ORDERS, DEMO_STATS } from "@/lib/demo-data"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function AgentDashboard() {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredOrders = DEMO_ORDERS.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Agent Dashboard</h2>
                    <p className="text-slate-500 font-medium">Overview of your sourcing activities and performance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="rounded-xl bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                        <ShoppingCart className="mr-2 h-4 w-4" /> New Sourcing Request
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {DEMO_STATS.map((stat, i) => (
                    <Card key={i} className={cn(
                        "border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden transition-transform duration-300 hover:-translate-y-1",
                        i === 0 ? "bg-gradient-to-br from-green-50 to-white" :
                            i === 1 ? "bg-gradient-to-br from-blue-50 to-white" :
                                i === 2 ? "bg-gradient-to-br from-purple-50 to-white" : "bg-gradient-to-br from-orange-50 to-white"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                                {stat.label}
                            </CardTitle>
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center",
                                i === 0 ? "bg-green-100 text-green-600" :
                                    i === 1 ? "bg-blue-100 text-blue-600" :
                                        i === 2 ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"
                            )}>
                                {i === 0 ? <DollarSign className="h-4 w-4" /> :
                                    i === 1 ? <ShoppingCart className="h-4 w-4" /> :
                                        i === 2 ? <Activity className="h-4 w-4" /> :
                                            <Users className="h-4 w-4" />}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={cn(
                                "text-3xl font-semibold",
                                i === 0 ? "text-green-900" :
                                    i === 1 ? "text-blue-900" :
                                        i === 2 ? "text-purple-900" : "text-orange-900"
                            )}>{stat.value}</div>
                            <div className="flex items-center text-xs mt-2 font-semibold">
                                {stat.trend === 'up' ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-600" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                                )}
                                <span className={stat.trend === 'up' ? "text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md" : "text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md"}>
                                    {stat.change}
                                </span>
                                <span className="text-slate-400 ml-2 font-medium">from last month</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Orders */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 p-8">
                    <div>
                        <CardTitle className="text-xl font-semibold text-slate-900">Assigned Orders</CardTitle>
                        <CardDescription className="text-slate-500 font-medium mt-1">Recent orders assigned to you for sourcing.</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-10 w-[240px] h-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider pl-8 h-12">Order ID</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Customer</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Vehicle</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Details</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Status</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase tracking-wider pr-8 h-12">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                            No assigned orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-blue-50/30 transition-colors border-slate-50 group cursor-pointer">
                                            <TableCell className="font-semibold text-slate-900 pl-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    {order.id}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold border border-blue-100">
                                                        {order.customerName.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-slate-700">{order.customerName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 py-5 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-4 w-4 text-slate-400" />
                                                    {order.vehicleInfo}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="text-sm">
                                                    <span className="font-semibold text-slate-900">{order.parts.length} parts</span>
                                                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
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
                                            <TableCell className="text-right pr-8 py-5">
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
