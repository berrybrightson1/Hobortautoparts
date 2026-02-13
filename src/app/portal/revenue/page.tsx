"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Inbox } from "lucide-react"

export default function RevenuePage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Revenue & Financials</h2>
                <p className="text-slate-500 font-medium">Track earnings, invoices, and financial performance.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-indigo-900/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-semibold text-indigo-900">$0.00</div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Tracking since inception</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-pink-900/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-pink-500">Outstanding Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-semibold text-pink-900">$0.00</div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">0 invoices pending payment</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-cyan-900/10 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-cyan-600">Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-semibold text-cyan-900">$0.00</div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Awaiting first transactions</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="pl-8 pt-8 pb-0">
                    <CardTitle className="text-xl font-semibold text-slate-900">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-[400px] w-full flex flex-col items-center justify-center text-slate-400 gap-4">
                        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                            <Inbox className="h-10 w-10 text-slate-200" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-semibold text-slate-600">No data to visualize</p>
                            <p className="text-sm">Revenue charts will generate automatically as sales are recorded.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
