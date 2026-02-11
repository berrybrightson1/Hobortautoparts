"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DEMO_DEMAND_HEATMAP } from "@/lib/demo-data"

const COLORS = ['#2563eb', '#f97316', '#10b981', '#6366f1']

export function DemandHeatmap() {
    const data = DEMO_DEMAND_HEATMAP.map(brand => ({
        name: brand.brand,
        requests: brand.models.reduce((acc, m) => acc + m.requests, 0)
    })).sort((a, b) => b.requests - a.requests)

    return (
        <Card className="rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black text-slate-900">Demand Intelligence</CardTitle>
                <CardDescription className="font-medium text-slate-400">Total parts requests categorized by vehicle brand.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    padding: '12px',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Bar dataKey="requests" radius={[0, 8, 8, 0]} barSize={24}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    {DEMO_DEMAND_HEATMAP.slice(0, 2).map((brand, i) => (
                        <div key={brand.brand} className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{brand.brand} Hot Model</p>
                            <p className="text-sm font-black text-slate-900">{brand.models[0].name}</p>
                            <p className="text-[10px] font-bold text-slate-400">{brand.models[0].requests} active requests</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
