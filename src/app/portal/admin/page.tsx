"use client"

import * as React from "react"
import {
    ShieldAlert,
    Users,
    TrendingUp,
    DollarSign,
    LayoutDashboard,
    Bell,
    Activity,
    Loader2,
    Calendar,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnalyticsChart } from "@/components/admin/analytics-chart"
import { DemandHeatmap } from "@/components/admin/demand-heatmap"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns"
import { StatsSkeleton, CardSkeleton, Skeleton } from "@/components/portal/skeletons"

export default function AdminPortal() {
    const [isLoading, setIsLoading] = React.useState(true)
    const [stats, setStats] = React.useState([
        { label: "Active Requests", value: "0", icon: LayoutDashboard, color: "text-blue-500", raw: 0 },
        { label: "Platform Users", value: "0", icon: Users, color: "text-blue-500", raw: 0 },
        { label: "Sourcing Success", value: "0%", icon: TrendingUp, color: "text-orange-500", raw: 0 },
    ])
    const [recentActivity, setRecentActivity] = React.useState<any[]>([])
    const [revenueData, setRevenueData] = React.useState<any[]>([])
    const [requestData, setRequestData] = React.useState<any[]>([])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            // 1. Fetch Users Count
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            // 2. Fetch Revenue
            const { data: orderData } = await supabase
                .from('orders')
                .select(`
                    status,
                    quotes (
                        total_amount
                    )
                `)
                .in('status', ['paid', 'processing', 'completed'])

            const totalRevenue = (orderData || []).reduce((acc: number, order: any) => {
                // Remove currency symbols and parse
                const amount = parseFloat(String(order.quotes?.total_amount || "0").replace(/[^0-9.-]+/g, ""))
                return acc + amount
            }, 0)

            // 3. Fetch Sourcing Stats for Success Rate
            const { count: totalRequests } = await supabase
                .from('sourcing_requests')
                .select('*', { count: 'exact', head: true })

            const { count: completedOrders } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'completed')

            const successRate = totalRequests && totalRequests > 0
                ? ((completedOrders || 0) / totalRequests * 100).toFixed(1)
                : "0.0"

            // 4. Fetch Recent Activity
            const { data: activity } = await supabase
                .from('sourcing_requests')
                .select(`
                    id,
                    created_at,
                    part_name,
                    profiles (
                        full_name
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(5)

            // 5. Generate Chart Data (Last 6 months)
            const months = eachMonthOfInterval({
                start: subMonths(new Date(), 5),
                end: new Date()
            })

            // Replace mock random data with zeroed data for start
            const realRevenueTrends = months.map(month => ({
                name: format(month, 'MMM'),
                revenue: 0,
                target: 0
            }))

            const realRequestVolume = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
                name: day,
                requests: 0,
                completed: 0
            }))

            setStats([
                { label: "Active Requests", value: (totalRequests || 0).toString(), icon: LayoutDashboard, color: "text-blue-500", raw: totalRequests || 0 },
                { label: "Platform Users", value: (userCount || 0).toString(), icon: Users, color: "text-blue-500", raw: userCount || 0 },
                { label: "Sourcing Success", value: `${successRate}%`, icon: TrendingUp, color: "text-orange-500", raw: parseFloat(successRate) },
            ])
            setRecentActivity(activity || [])
            setRevenueData(realRevenueTrends)
            setRequestData(realRequestVolume)

        } catch (error) {
            console.error("Error fetching admin data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-10 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>
                <StatsSkeleton />
                <div className="grid grid-cols-1 gap-8">
                    <CardSkeleton />
                </div>
                <div className="grid grid-cols-1 gap-8">
                    <CardSkeleton />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tighter flex items-center gap-4">
                        System Control <ShieldAlert className="h-6 w-6 sm:h-8 sm:w-8 text-primary-orange" />
                    </h2>
                    <p className="text-slate-500 font-bold text-sm sm:text-base tracking-tight">Global platform health and transaction monitoring.</p>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-2 text-primary-orange font-bold text-[10px] uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
                        <Loader2 className="h-4 w-4 animate-spin" /> Live Syncing...
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={
                            stat.label === "Active Requests" ? "/portal/admin/requests" :
                                stat.label === "Platform Users" ? "/portal/users" :
                                    stat.label === "Sourcing Success" ? "/portal/admin/orders" : "#"
                        }
                        className={cn(
                            "p-6 sm:p-8 rounded-2xl sm:rounded-2xl border shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 bg-white cursor-pointer active:scale-95",
                            stat.label.includes("Revenue") ? "hover:border-green-100" :
                                stat.label.includes("Users") ? "hover:border-blue-100" :
                                    "hover:border-orange-100"
                        )}
                    >
                        <div className="space-y-1">
                            <p className={cn(
                                "text-[10px] sm:text-[10px] font-bold uppercase tracking-[0.2em]",
                                stat.label.includes("Revenue") ? "text-green-600" :
                                    stat.label.includes("Users") ? "text-blue-600" : "text-orange-600"
                            )}>{stat.label}</p>
                            <p className={cn(
                                "text-2xl sm:text-4xl font-bold tracking-tighter",
                                stat.label.includes("Revenue") ? "text-slate-900" :
                                    stat.label.includes("Users") ? "text-slate-900" : "text-slate-900"
                            )}>{stat.value}</p>
                        </div>
                        <div className={cn(
                            "h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                            stat.label.includes("Revenue") ? "bg-green-50 text-green-600" :
                                stat.label.includes("Users") ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                        )}>
                            <stat.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Analytics Section - Simplified to Request Volume */}
            <div className="grid grid-cols-1 gap-8">
                <AnalyticsChart
                    title="Request Volume"
                    description="Active sourcing requests over time."
                    data={requestData}
                    index="name"
                    categories={["requests", "completed"]}
                    colors={["#3b82f6", "#10b981"]}
                    type="bar"
                    className="rounded-2xl shadow-xl shadow-slate-200/40 border-slate-100"
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* System Activity */}
                <div className="bg-white rounded-2xl sm:rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-xl shadow-slate-200/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary-orange" /> Real-time Activity
                        </h3>
                        <Link href="/portal/admin/approvals" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline w-fit">
                            Approvals Queue
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/portal/admin/requests?id=${item.id}`}
                                    className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 group cursor-pointer"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-blue-50/50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-md transition-all">
                                        <Bell className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">New Sourcing: {item.part_name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1 flex items-center gap-2">
                                            {format(new Date(item.created_at), 'MMM dd, HH:mm')} • {item.profiles?.full_name || 'Anonymous User'}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300 self-center opacity-0 group-hover:opacity-100 transition-all mr-2" />
                                </Link>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-50">
                                <Calendar className="h-10 w-10 text-slate-200" />
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No recent activity detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
