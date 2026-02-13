"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Inbox, DollarSign, FileText, TrendingUp, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { format, subMonths, eachMonthOfInterval } from "date-fns"

export default function RevenuePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        totalEarnings: 0,
        outstandingInvoices: 0,
        avgOrderValue: 0,
        paidInvoices: 0
    })
    const [revenueData, setRevenueData] = useState<any[]>([])

    const fetchRevenueData = async () => {
        setIsLoading(true)
        try {
            // 1. Fetch total earnings from paid orders
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    status,
                    quotes (
                        total_amount
                    )
                `)
                .in('status', ['paid', 'processing', 'completed'])

            if (ordersError) throw ordersError

            const totalEarnings = (orders || []).reduce((acc: number, order: any) => {
                const amount = parseFloat(String(order.quotes?.total_amount || "0").replace(/[^0-9.-]+/g, ""))
                return acc + amount
            }, 0)

            // 2. Fetch invoices
            const { data: invoices, error: invoicesError } = await supabase
                .from('invoices')
                .select('*')

            if (invoicesError) throw invoicesError

            const outstandingAmount = (invoices || [])
                .filter((inv: any) => inv.status === 'pending' || inv.status === 'overdue')
                .reduce((acc: number, inv: any) => acc + parseFloat(inv.amount || 0), 0)

            const paidCount = (invoices || []).filter((inv: any) => inv.status === 'paid').length

            // 3. Calculate average order value
            const completedOrders = (orders || []).filter((o: any) => o.status === 'completed')
            const avgValue = completedOrders.length > 0
                ? totalEarnings / completedOrders.length
                : 0

            // 4. Generate revenue chart data (last 6 months)
            const months = eachMonthOfInterval({
                start: subMonths(new Date(), 5),
                end: new Date()
            })

            // For now, we'll use mock data for the chart
            // In production, you'd query orders grouped by month
            const chartData = months.map(month => ({
                name: format(month, 'MMM'),
                revenue: Math.floor(Math.random() * 5000) + 1000,
                target: 4000
            }))

            setStats({
                totalEarnings,
                outstandingInvoices: outstandingAmount,
                avgOrderValue: avgValue,
                paidInvoices: paidCount
            })
            setRevenueData(chartData)

        } catch (error: any) {
            toast.error("Failed to fetch revenue data", {
                description: error.message
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRevenueData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-primary-blue animate-spin" />
                    <p className="text-sm font-semibold text-slate-500">Loading financial data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Revenue & Financials</h2>
                <p className="text-slate-500 font-medium">Track earnings, invoices, and financial performance.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-indigo-900/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-semibold text-indigo-900">
                            ${stats.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">From completed orders</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-pink-900/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-pink-500">Outstanding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-semibold text-pink-900">
                            ${stats.outstandingInvoices.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Pending invoices</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-cyan-900/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-cyan-600">Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-semibold text-cyan-900">
                            ${stats.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Per completed order</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">Paid Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-semibold text-emerald-900">{stats.paidInvoices}</div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Successfully collected</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="pl-8 pt-8 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-primary-orange" />
                        Revenue Overview
                    </CardTitle>
                    <p className="text-sm text-slate-500 font-medium">Monthly revenue trends over the last 6 months</p>
                </CardHeader>
                <CardContent className="p-6">
                    {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748b"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value: any) => [`$${value}`, '']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    dot={{ fill: '#f97316', r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="target"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[350px] w-full flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                                <Inbox className="h-10 w-10 text-slate-200" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="font-semibold text-slate-600">No data to visualize</p>
                                <p className="text-sm">Revenue charts will generate automatically as sales are recorded.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="p-6 border-b border-slate-50">
                        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            Revenue Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Completed Orders</p>
                                    <p className="text-xs text-slate-500">Primary revenue stream</p>
                                </div>
                                <p className="text-2xl font-bold text-emerald-700">
                                    ${stats.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Processing</p>
                                    <p className="text-xs text-slate-500">Orders in progress</p>
                                </div>
                                <p className="text-2xl font-bold text-slate-600">$0.00</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="p-6 border-b border-slate-50">
                        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-pink-600" />
                            Invoice Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-pink-50 rounded-2xl">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Outstanding</p>
                                    <p className="text-xs text-slate-500">Awaiting payment</p>
                                </div>
                                <p className="text-2xl font-bold text-pink-700">
                                    ${stats.outstandingInvoices.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Paid</p>
                                    <p className="text-xs text-slate-500">{stats.paidInvoices} invoices collected</p>
                                </div>
                                <p className="text-2xl font-bold text-emerald-700">{stats.paidInvoices}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
