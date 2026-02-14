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
    Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnalyticsChart } from "@/components/admin/analytics-chart"
import { DemandHeatmap } from "@/components/admin/demand-heatmap"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns"

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

            const mockRevenueTrends = months.map(month => ({
                name: format(month, 'MMM'),
                revenue: Math.floor(Math.random() * 5000) + 1000, // Still mock until enough data
                target: 4000
            }))

            const mockRequestVolume = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
                name: day,
                requests: Math.floor(Math.random() * 20) + 5,
                completed: Math.floor(Math.random() * 15) + 2
            }))

            setStats([
                { label: "Active Requests", value: (totalRequests || 0).toString(), icon: LayoutDashboard, color: "text-blue-500", raw: totalRequests || 0 },
                { label: "Platform Users", value: (userCount || 0).toString(), icon: Users, color: "text-blue-500", raw: userCount || 0 },
                { label: "Sourcing Success", value: `${successRate}%`, icon: TrendingUp, color: "text-orange-500", raw: parseFloat(successRate) },
            ])
            setRecentActivity(activity || [])
            setRevenueData(mockRevenueTrends)
            setRequestData(mockRequestVolume)

        } catch (error) {
            console.error("Dashboard hydration error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-4">
                        System Control <ShieldAlert className="h-8 w-8 text-primary-orange" />
                    </h2>
                    <p className="text-slate-500 font-medium">Global platform health and transaction monitoring.</p>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-2 text-primary-orange font-bold text-[10px] uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
                        <Loader2 className="h-4 w-4 animate-spin" /> Live Syncing...
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat) => (
                    <div key={stat.label} className={cn(
                        "p-8 rounded-[2.5rem] border shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 bg-white",
                        stat.label.includes("Revenue") ? "hover:border-green-100" :
                            stat.label.includes("Users") ? "hover:border-blue-100" :
                                "hover:border-orange-100"
                    )}>
                        <div className="space-y-1">
                            <p className={cn(
                                "text-[10px] font-bold uppercase tracking-[0.2em]",
                                stat.label.includes("Revenue") ? "text-green-600" :
                                    stat.label.includes("Users") ? "text-blue-600" : "text-orange-600"
                            )}>{stat.label}</p>
                            <p className={cn(
                                "text-4xl font-bold tracking-tighter",
                                stat.label.includes("Revenue") ? "text-slate-900" :
                                    stat.label.includes("Users") ? "text-slate-900" : "text-slate-900"
                            )}>{stat.value}</p>
                        </div>
                        <div className={cn(
                            "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                            stat.label.includes("Revenue") ? "bg-green-50 text-green-600" :
                                stat.label.includes("Users") ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                        )}>
                            <stat.icon className="h-8 w-8" />
                        </div>
                    </div>
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
                    className="rounded-[2.5rem] shadow-xl shadow-slate-200/40 border-slate-100"
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* System Activity */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                            <Activity className="h-6 w-6 text-primary-orange" /> Real-time Activity
                        </h3>
                        <Link href="/portal/admin/approvals" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">
                            Queue Details
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((item) => (
                                <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-3xl transition-colors border border-transparent hover:border-slate-100 group cursor-default">
                                    <div className="h-12 w-12 rounded-2xl bg-blue-50/50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-md transition-all">
                                        <Bell className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">New Sourcing: {item.part_name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1 flex items-center gap-2">
                                            {format(new Date(item.created_at), 'MMM dd, HH:mm')} • {item.profiles?.full_name || 'Anonymous Entity'}
                                        </p>
                                    </div>
                                </div>
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
