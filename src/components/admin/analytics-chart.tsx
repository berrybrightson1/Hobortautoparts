"use client"

import { useMemo } from "react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnalyticsChartProps {
    title: string
    description?: string
    data: any[]
    index: string
    categories: string[]
    colors?: string[]
    type?: "area" | "bar"
    className?: string
    valuePrefix?: string
}

export function AnalyticsChart({
    title,
    description,
    data,
    index,
    categories,
    colors = ["#2563ea", "#e11d48"],
    type = "area",
    className,
    valuePrefix = "",
}: AnalyticsChartProps) {
    const ChartComponent = type === "area" ? AreaChart : BarChart

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-xl text-xs">
                    <p className="font-bold text-slate-700 mb-1">{label}</p>
                    {payload.map((entry: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-slate-500 capitalize">{entry.name}:</span>
                            <span className="font-bold text-slate-900">
                                {valuePrefix}
                                {entry.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <Card className={cn("overflow-hidden border-slate-100 shadow-sm", className)}>
            <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800">{title}</CardTitle>
                {description && (
                    <CardDescription className="text-sm text-slate-500">
                        {description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="pl-0">
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ChartComponent data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                {categories.map((category, i) => (
                                    <linearGradient
                                        key={category}
                                        id={`color-${category}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey={index}
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${valuePrefix}${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                            <Legend
                                wrapperStyle={{ paddingTop: "20px" }}
                                formatter={(value) => <span className="text-slate-600 font-medium text-sm capitalize">{value}</span>}
                            />
                            {categories.map((category, i) => (
                                type === "area" ? (
                                    <Area
                                        key={category}
                                        type="monotone"
                                        dataKey={category}
                                        stroke={colors[i % colors.length]}
                                        fillOpacity={1}
                                        fill={`url(#color-${category})`}
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                ) : (
                                    <Bar
                                        key={category}
                                        dataKey={category}
                                        fill={colors[i % colors.length]}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={50}
                                    />
                                )
                            ))}
                        </ChartComponent>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
