"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Package, Car, Clock, ChevronRight, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

export default function CustomerDashboard() {
    const { profile } = useAuth()
    const orders: any[] = [] // Future: fetch from Supabase

    // Determine status color helper
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
            case 'quoted': return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
            case 'shipped': return "bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200"
            case 'delivered': return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
            default: return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200"
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'}!
                    </h2>
                    <p className="text-slate-500 font-medium">Track your orders and manage your vehicle sourcing requests.</p>
                </div>
                <Button className="bg-primary-orange hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-900/20 px-6 h-11 transition-all active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> New Request
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content: Orders */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-semibold text-slate-900">Recent Activity</h3>
                        <Button variant="link" className="text-primary-blue font-semibold text-sm hover:no-underline hover:text-blue-700" disabled={orders.length === 0}>
                            View All <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <Card key={order.id} className="border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group rounded-[2rem] bg-white">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Status Indicator Strip */}
                                            <div className={cn("w-full sm:w-2 h-2 sm:h-auto transition-colors duration-300",
                                                order.status === 'pending' ? "bg-yellow-400 group-hover:bg-yellow-500" :
                                                    order.status === 'quoted' ? "bg-blue-400 group-hover:bg-blue-500" :
                                                        order.status === 'delivered' ? "bg-green-400 group-hover:bg-green-500" : "bg-slate-300"
                                            )} />

                                            <div className="flex-1 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary-blue group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-blue-900/20">
                                                    <Package className="h-7 w-7" />
                                                </div>

                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-lg text-slate-900">{order.vehicle_info}</p>
                                                        <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{order.id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                        <span>{order.parts?.join(", ")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 pt-2">
                                                        <Badge className={cn("rounded-lg px-2.5 py-0.5 border font-semibold shadow-sm", getStatusColor(order.status))}>
                                                            {order.status}
                                                        </Badge>
                                                        <span className="text-xs text-slate-400 flex items-center font-medium">
                                                            <Clock className="h-3 w-3 mr-1.5" />
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Button variant="outline" className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-600 font-semibold hover:text-primary-blue hover:border-blue-200 hover:bg-blue-50 transition-all">
                                                    Details
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Inbox className="h-8 w-8" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-lg font-semibold text-slate-900">No active requests yet</p>
                                    <p className="text-sm text-slate-500 font-medium">When you place an order, it will appear here.</p>
                                </div>
                                <Button variant="outline" className="mt-2 rounded-xl border-slate-200">
                                    Create Your First Request
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: My Vehicles */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-semibold text-slate-900">My Garage</h3>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                            <Plus className="h-5 w-5 text-slate-500" />
                        </Button>
                    </div>

                    <Card className="border-slate-100 shadow-xl shadow-slate-200/40 bg-white rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4">
                            <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                                <Car className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-900">Your garage is empty</p>
                                <p className="text-xs text-slate-400 font-medium">Add vehicles to speed up your sourcing requests.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary-blue to-blue-700 text-white border-none shadow-xl shadow-blue-900/30 rounded-[2rem] overflow-hidden relative">
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                        <CardHeader className="relative z-10 pb-2">
                            <CardTitle className="text-xl font-semibold">Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-blue-50 text-sm space-y-6 relative z-10">
                            <p className="font-medium leading-relaxed">Our expert agents are ready to assist you with finding the exact parts for your vehicle.</p>
                            <Button className="w-full bg-white text-primary-blue hover:bg-blue-50 font-semibold rounded-xl h-11 shadow-lg shadow-black/10 border-0 transition-all">
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
