"use client"

import * as React from "react"
import { usePortalStore } from "@/lib/store"
import {
    ShieldAlert,
    Users,
    TrendingUp,
    DollarSign,
    LayoutDashboard,
    Bell,
    Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnalyticsChart } from "@/components/admin/analytics-chart"
import { DemandHeatmap } from "@/components/admin/demand-heatmap"
import Link from "next/link"

export default function AdminPortal() {
    const orders = usePortalStore(state => state.orders)

    const stats = [
        { label: "Total Revenue (Est)", value: `$${orders.length * 1250}`, icon: DollarSign, color: "text-green-500" },
        { label: "Platform Users", value: "142", icon: Users, color: "text-blue-500" },
        { label: "Sourcing Success", value: "98.2%", icon: TrendingUp, color: "text-orange-500" },
    ]

    return (
        <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-4">
                    System Control <ShieldAlert className="h-8 w-8 text-primary-orange" />
                </h2>
                <p className="text-slate-500 font-medium">Global platform health and transaction monitoring.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat) => (
                    <div key={stat.label} className={cn(
                        "p-8 rounded-[2.5rem] border shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500",
                        stat.label.includes("Revenue") ? "bg-gradient-to-br from-green-50 to-white border-green-100" :
                            stat.label.includes("Users") ? "bg-gradient-to-br from-blue-50 to-white border-blue-100" :
                                "bg-gradient-to-br from-orange-50 to-white border-orange-100"
                    )}>
                        <div>
                            <p className={cn(
                                "text-[10px] font-semibold uppercase tracking-[0.2em] mb-2",
                                stat.label.includes("Revenue") ? "text-green-600" :
                                    stat.label.includes("Users") ? "text-blue-600" : "text-orange-600"
                            )}>{stat.label}</p>
                            <p className={cn(
                                "text-4xl font-semibold",
                                stat.label.includes("Revenue") ? "text-green-900" :
                                    stat.label.includes("Users") ? "text-blue-900" : "text-orange-900"
                            )}>{stat.value}</p>
                        </div>
                        <div className={cn(
                            "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                            stat.label.includes("Revenue") ? "bg-green-100 text-green-600" :
                                stat.label.includes("Users") ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                        )}>
                            <stat.icon className="h-8 w-8" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnalyticsChart
                    title="Revenue Trends"
                    description="Monthly revenue vs. projected targets."
                    data={[
                        { name: "Jan", revenue: 4000, target: 2400 },
                        { name: "Feb", revenue: 3000, target: 1398 },
                        { name: "Mar", revenue: 2000, target: 9800 },
                        { name: "Apr", revenue: 2780, target: 3908 },
                        { name: "May", revenue: 1890, target: 4800 },
                        { name: "Jun", revenue: 2390, target: 3800 },
                    ]}
                    index="name"
                    categories={["revenue", "target"]}
                    colors={["#f97316", "#3b82f6"]}
                    valuePrefix="$"
                    className="rounded-[2.5rem] shadow-xl shadow-slate-200/40 border-slate-100"
                />
                <AnalyticsChart
                    title="Request Volume"
                    description="Active sourcing requests over time."
                    data={[
                        { name: "Mon", requests: 12, completed: 8 },
                        { name: "Tue", requests: 18, completed: 12 },
                        { name: "Wed", requests: 15, completed: 10 },
                        { name: "Thu", requests: 25, completed: 20 },
                        { name: "Fri", requests: 30, completed: 28 },
                        { name: "Sat", requests: 22, completed: 18 },
                        { name: "Sun", requests: 10, completed: 5 },
                    ]}
                    index="name"
                    categories={["requests", "completed"]}
                    colors={["#3b82f6", "#10b981"]}
                    type="bar"
                    className="rounded-[2.5rem] shadow-xl shadow-slate-200/40 border-slate-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DemandHeatmap />

                {/* System Activity */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                            <Activity className="h-6 w-6 text-primary-orange" /> Live Activity
                        </h3>
                        <Link href="/portal/admin/approvals" className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest hover:underline">
                            View Compliance Queue
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-3xl transition-colors border border-transparent hover:border-slate-100 group cursor-default">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-md transition-all">
                                    <Bell className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900">New Sourcing Request Submitted</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">2 minutes ago • Customer ID: #451</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Distribution */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-xl shadow-slate-900/20 group">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                            <TrendingUp className="h-6 w-6 text-primary-orange" />
                            Global Distribution
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-widest opacity-80">
                                    <span>Air Freight (Express)</span>
                                    <span>68%</span>
                                </div>
                                <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-primary-orange to-orange-400 w-[68%] shadow-[0_0_15px_rgba(249,115,22,0.5)] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-widest opacity-80">
                                    <span>Sea Freight (Bulk)</span>
                                    <span>32%</span>
                                </div>
                                <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-[32%] shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 mt-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                            <span>Efficiency up 12% this week</span>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-700">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_2px,transparent_1px)] [background-size:24px_24px]" />
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-orange/30 rounded-full blur-[100px]" />
                        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/30 rounded-full blur-[100px]" />
                    </div>
                </div>
            </div>
        </div>
    )
}
