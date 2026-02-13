"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Package, Car, Clock, ChevronRight, Inbox, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export default function CustomerDashboard() {
    const { profile, user } = useAuth()
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchOrders = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('sourcing_requests')
                .select('*')
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

    useEffect(() => {
        fetchOrders()
    }, [user])

    // Determine status color helper
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
            case 'processing': return "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
            case 'quoted': return "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
            case 'shipped': return "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
            case 'completed': return "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
            default: return "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-semibold tracking-tighter text-slate-900 leading-none">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'}!
                    </h2>
                    <p className="text-slate-500 font-medium text-lg pt-2">Track your orders and manage your vehicle sourcing requests.</p>
                </div>
                <Button
                    onClick={() => router.push('/quote')}
                    className="bg-primary-orange hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-orange-900/20 px-8 h-14 transition-all active:scale-95"
                >
                    <Plus className="mr-3 h-5 w-5" /> New Request
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content: Orders */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
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
                        ) : orders.length > 0 ? (
                            orders.map((order) => (
                                <Card key={order.id} className="border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group rounded-[2.5rem] bg-white ring-1 ring-slate-100/50">
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

                                            <div className="flex-1 p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary-blue group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-blue-900/20">
                                                    <Package className="h-7 w-7" />
                                                </div>

                                                <div className="flex-1 space-y-1.5 min-w-0">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <p className="font-bold text-xl text-slate-900 truncate">{order.vehicle_info || order.part_name}</p>
                                                        <span className="shrink-0 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">#{order.id.slice(0, 8)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium truncate">
                                                        <span>{order.part_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 pt-2">
                                                        <Badge className={cn("rounded-lg px-3 py-1 border-0 shadow-sm font-bold text-[10px] uppercase tracking-wider", getStatusColor(order.status))}>
                                                            {order.status}
                                                        </Badge>
                                                        <span className="text-[10px] text-slate-400 flex items-center font-bold uppercase tracking-widest">
                                                            <Calendar className="h-3 w-3 mr-1.5" />
                                                            {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Button variant="outline" className="w-full sm:w-auto rounded-xl border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:text-primary-blue hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95 shrink-0">
                                                    View Lifecycle
                                                </Button>
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
                                    <p className="text-2xl font-bold text-slate-900 leading-none">No active requests yet</p>
                                    <p className="text-sm text-slate-500 font-medium">When you place an order, it will appear here.</p>
                                </div>
                                <Button
                                    onClick={() => router.push('/quote')}
                                    variant="outline"
                                    className="rounded-full h-12 px-8 border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:border-primary-orange hover:text-primary-orange transition-all"
                                >
                                    Create Your First Request
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: My Vehicles */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                            <Car className="h-6 w-6 text-primary-orange" /> My Garage
                        </h3>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>

                    <Card className="border-slate-100 shadow-xl shadow-slate-200/40 bg-white rounded-[2.5rem] overflow-hidden group">
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-6">
                            <div className="h-16 w-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                                <Car className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-slate-900 leading-none">Your garage is empty</p>
                                <p className="text-xs text-slate-400 font-semibold leading-relaxed">Add vehicles to speed up your sourcing requests.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20 rounded-[2.5rem] overflow-hidden relative group">
                        {/* Decorative background effects */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-orange/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary-orange/30 transition-colors" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-blue/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl group-hover:bg-primary-blue/30 transition-colors" />

                        <CardHeader className="relative z-10 pb-2">
                            <CardTitle className="text-2xl font-bold tracking-tight">Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400 text-sm space-y-8 relative z-10">
                            <p className="font-medium leading-relaxed">Our expert agents are ready to assist you with finding the exact parts for your vehicle.</p>
                            <Button className="w-full bg-white text-slate-900 hover:bg-primary-orange hover:text-white font-bold uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-black/10 border-0 transition-all active:scale-95">
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
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
            <line x1="3" x2="21" y1="10" border-slate-100 />
        </svg>
    )
}
