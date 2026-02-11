"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { REVENUE_DATA, DEMO_STATS } from "@/lib/demo-data"

export default function RevenuePage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Revenue & Financials</h2>
                <p className="text-slate-500 font-medium">Track earnings, invoices, and financial performance.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-indigo-900/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-indigo-900">{DEMO_STATS[0].value}</div>
                        <p className="text-xs text-emerald-600 mt-2 font-bold bg-emerald-100 w-fit px-2 py-1 rounded-lg flex items-center gap-1">
                            <span className="text-emerald-500">↑</span>
                            {DEMO_STATS[0].change} from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-pink-900/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-pink-500">Outstanding Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-pink-900">$2,340.00</div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">3 invoices pending payment</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-cyan-900/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-cyan-900">$2,544.12</div>
                        <p className="text-xs text-emerald-600 mt-2 font-bold bg-emerald-100 w-fit px-2 py-1 rounded-lg flex items-center gap-1">
                            <span className="text-emerald-500">↑</span>
                            +5.2% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="pl-8 pt-8 pb-0">
                    <CardTitle className="text-xl font-bold text-slate-900">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={REVENUE_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(value) => `$${value}`}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="#2563eb"
                                    radius={[8, 8, 8, 8]}
                                    barSize={50}
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
