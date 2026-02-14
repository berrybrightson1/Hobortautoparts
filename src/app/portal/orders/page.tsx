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
    Truck,
    Inbox
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { format } from "date-fns"
import { toast } from "sonner"

export default function OrdersPage() {
    const { user, profile } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchOrders = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            let query = supabase
                .from('orders')
                .select(`
                    id,
                    status,
                    created_at,
                    transaction_ref,
                    profiles:user_id (
                        full_name
                    ),
                    quotes:quote_id (
                        total_amount,
                        sourcing_requests:request_id (
                            vehicle_info,
                            part_name,
                            vin
                        )
                    )
                `)
                .order('created_at', { ascending: false })

            // If agent, only show their assigned orders
            if (profile?.role === 'agent') {
                query = query.eq('agent_id', user.id)
            } else if (profile?.role === 'customer') {
                query = query.eq('user_id', user.id)
            }

            const { data, error } = await query

            if (error) throw error
            setOrders(data || [])
        } catch (error: any) {
            console.error("Error fetching orders:", error)
            toast.error("Failed to load orders")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [user, profile])

    const filteredOrders = orders.filter(order =>
        order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.quotes?.sourcing_requests?.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.quotes?.sourcing_requests?.part_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">All Orders</h2>
                    <p className="text-slate-500 font-medium">Manage and track all sourcing requests across the platform.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button className="rounded-xl bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 font-semibold">
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
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider pl-6 h-12">Order ID</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Customer</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Vehicle</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Date</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                                                    <Inbox className="h-8 w-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-semibold text-slate-900">No orders found</p>
                                                    <p className="text-sm text-slate-500 font-medium">New orders will appear here after they are created.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const request = order.quotes?.sourcing_requests
                                        return (
                                            <TableRow key={order.id} className="hover:bg-blue-50/30 transition-colors border-slate-50 group cursor-pointer">
                                                <TableCell className="pl-6 py-4 font-bold text-slate-900">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="py-4 font-medium text-slate-600">
                                                    {order.profiles?.full_name || 'Anonymous'}
                                                </TableCell>
                                                <TableCell className="py-4 font-semibold text-slate-500">
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-900">{request?.part_name || 'N/A'}</span>
                                                        <span className="text-xs font-normal">{request?.vehicle_info || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge className={cn(
                                                        "rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider",
                                                        order.status === 'paid' ? "bg-emerald-100 text-emerald-600" :
                                                            order.status === 'pending_payment' ? "bg-orange-100 text-orange-600" :
                                                                "bg-blue-100 text-blue-600"
                                                    )}>
                                                        {order.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-4 font-medium text-slate-500">
                                                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell className="text-right pr-6 py-4">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md transition-all">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
