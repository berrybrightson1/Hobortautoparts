"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, TrendingUp, Users, ShoppingBag, PackageSearch, Activity, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function AgentDashboardHub() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState([
        { label: "Active Sourcing", value: "0", icon: PackageSearch, color: "text-blue-500", bg: "bg-blue-50", trend: "up" },
        { label: "Completed Orders", value: "0", icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-50", trend: "up" },
        { label: "Pending Feedback", value: "0", icon: Activity, color: "text-orange-500", bg: "bg-orange-50", trend: "up" },
        { label: "Success Rate", value: "0%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50", trend: "up" },
    ])
    const [recentRequests, setRecentRequests] = useState<any[]>([])

    const fetchStats = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            // 1. Fetch Sourcing Requests
            const { data: sourcingData, error: sourcingError } = await supabase
                .from('sourcing_requests')
                .select('*')
                .eq('agent_id', user.id)

            if (sourcingError) throw sourcingError

            // 2. Fetch Orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('agent_id', user.id)

            if (ordersError) throw ordersError

            // 3. Fetch Recent Messages for Agent (Simplified for now)
            const { count: messageCount } = await supabase
                .from('request_messages')
                .select('*', { count: 'exact', head: true })
                .neq('sender_id', user.id)

            // Calculate metrics
            const activeSourcing = sourcingData?.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length || 0
            const completedOrders = ordersData?.filter(o => o.status === 'completed').length || 0
            const totalSourcing = sourcingData?.length || 0
            const successRate = totalSourcing > 0
                ? Math.round((completedOrders / totalSourcing) * 100)
                : 0

            setStats([
                { label: "Active Sourcing", value: activeSourcing.toString(), icon: PackageSearch, color: "text-blue-500", bg: "bg-blue-50", trend: "up" },
                { label: "Completed Orders", value: completedOrders.toString(), icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-50", trend: "up" },
                { label: "Pending Feedback", value: (messageCount || 0).toString(), icon: Activity, color: "text-orange-500", bg: "bg-orange-50", trend: "up" },
                { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50", trend: "up" },
            ])

            setRecentRequests(sourcingData?.slice(0, 5) || [])

        } catch (error: any) {
            console.error("Error fetching agent stats:", error)
            toast.error("Fetch Failed", { description: "Could not sync your live dashboard data." })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [user])

    if (isLoading && stats[0].value === "0") {
        return (
            <div className="h-[60vh] w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900">Agent Hub</h2>
                    <p className="text-slate-500 font-medium text-lg">Your command center for sourcing operations and performance tracking.</p>
                </div>
                <Button variant="outline" onClick={fetchStats} className="rounded-xl border-slate-200">
                    <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Update Live
                </Button>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</CardTitle>
                            <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tighter text-slate-900">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl bg-white ring-1 ring-slate-100/50 p-8">
                    <CardHeader className="px-0">
                        <CardTitle className="text-2xl font-bold tracking-tight">Recent Pipeline Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 py-4">
                        <div className="space-y-6">
                            {recentRequests.length > 0 ? recentRequests.map((req, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{req.part_name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{req.status}</p>
                                    </div>
                                    <div className={cn("h-2 w-2 rounded-full",
                                        req.status === 'quoted' ? "bg-purple-500" :
                                            req.status === 'completed' ? "bg-emerald-500" : "bg-blue-500"
                                    )} />
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active requests</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl bg-white ring-1 ring-slate-100/50 p-8">
                    <CardHeader className="px-0">
                        <CardTitle className="text-2xl font-bold tracking-tight">Active Inquiries</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 py-4">
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <Activity className="h-8 w-8 text-slate-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900">Live communication enabled</p>
                                <p className="text-xs text-slate-400 font-medium">Use the pipeline view to chat with customers in real-time.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
