"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Award, Target, Zap, Clock, ShieldCheck, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

export default function AgentPerformanceHub() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [performance, setPerformance] = useState({
        speed: "0/100",
        resolution: "0%",
        rank: "N/A",
        badge: "Rising Sourcing"
    })

    const fetchPerformance = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            // 1. Fetch Sourcing Requests and their first Quotes
            const { data: requests, error } = await supabase
                .from('sourcing_requests')
                .select(`
                    id, 
                    created_at, 
                    status,
                    quotes (created_at)
                `)
                .eq('agent_id', user.id)

            if (error) throw error

            // 2. Calculate Sourcing Speed
            // Measure time from request creation to first quote
            let totalSpeedScore = 0
            let ratedRequests = 0

            requests?.forEach(req => {
                const firstQuote = req.quotes?.[0]
                if (firstQuote) {
                    const start = new Date(req.created_at).getTime()
                    const end = new Date(firstQuote.created_at).getTime()
                    const hours = (end - start) / (1000 * 60 * 60)

                    // Score: < 2h = 100, < 4h = 90, < 12h = 70, < 24h = 50
                    if (hours <= 2) totalSpeedScore += 100
                    else if (hours <= 4) totalSpeedScore += 90
                    else if (hours <= 12) totalSpeedScore += 70
                    else if (hours <= 24) totalSpeedScore += 50
                    else totalSpeedScore += 30
                    ratedRequests++
                }
            })

            const avgSpeed = ratedRequests > 0 ? Math.round(totalSpeedScore / ratedRequests) : 0

            // 3. Calculate Resolution Rate (Quoted -> Completed)
            const completed = requests?.filter(r => r.status === 'completed').length || 0
            const quoted = requests?.filter(r => r.status === 'quoted' || r.status === 'completed').length || 0
            const resolutionRate = quoted > 0 ? Math.round((completed / quoted) * 100) : 0

            // 4. Update state
            setPerformance({
                speed: `${avgSpeed}/100`,
                resolution: `${resolutionRate}%`,
                rank: avgSpeed > 80 ? "Top 10%" : "Global Network",
                badge: avgSpeed > 90 ? "Elite Sourcing" : "Vetted Agent"
            })

        } catch (error) {
            console.error("Error fetching performance metrics:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPerformance()
    }, [user])

    const achievements = [
        { title: "Sourcing Speed", value: performance.speed, sub: "Based on Response Time", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
        { title: "Resolution Rate", value: performance.resolution, sub: "Quoted to Fulfillment", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
        { title: "Platform Standing", value: performance.badge, sub: performance.rank, icon: Award, color: "text-blue-500", bg: "bg-blue-50" },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="space-y-1">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 leading-tight">Performance Hub</h2>
                <p className="text-slate-500 font-medium text-lg">Detailed insights into your sourcing efficiency and platform standing.</p>
            </div>

            {isLoading ? (
                <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-orange" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Analyzing Performance...</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-3">
                    {achievements.map((item, i) => (
                        <Card key={i} className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white ring-1 ring-slate-100/50 p-4">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.title}</CardTitle>
                                <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", item.bg, item.color)}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tighter text-slate-900">{item.value}</div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-2">{item.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white ring-1 ring-slate-100/50 p-8">
                <CardHeader className="px-0">
                    <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-3 leading-tight">
                        <Target className="h-6 w-6 text-primary-orange" /> Growth Trajectory
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 py-10 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                        <TrendingUp className="h-10 w-10 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-lg font-bold text-slate-900">Consistency is Key</p>
                        <p className="text-sm text-slate-500 max-w-sm font-medium">Continue resolving sourcing requests within 4 hours to maintain your "{performance.badge}" standing.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
