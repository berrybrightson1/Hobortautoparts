"use client"

import { DEMO_ORDERS, getTrackingSteps } from "@/lib/demo-data"
import { ShieldCheck, MapPin, Truck, ChevronRight, AlertCircle, Search, PackageSearch } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import * as React from "react"

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const orderId = id
    const order = DEMO_ORDERS.find(o => o.id.toLowerCase() === orderId.toLowerCase())

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
                <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Order Not Found</h1>
                    <p className="text-slate-500 max-w-md">We couldn't find an active order with ID <span className="font-mono font-bold text-slate-900">{orderId}</span>. Please check the ID and try again.</p>
                </div>
                <Link href="/">
                    <Button variant="outline" className="gap-2">
                        <Search className="h-4 w-4" /> Try Another Search
                    </Button>
                </Link>
            </div>
        )
    }

    const steps = getTrackingSteps(order.status, order.createdAt)
    const currentStepIndex = steps.findIndex(s => !s.completed)
    const activeStep = currentStepIndex === -1 ? steps[steps.length - 1] : steps[currentStepIndex - 1] || steps[0]

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/" className="hover:text-primary-blue transition-colors font-medium flex items-center gap-1">
                        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
                    </Link>
                    <div className="h-4 w-px bg-slate-200 mx-2" />
                    <span className="hidden md:inline">Track Shipment</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 hidden md:inline" />
                    <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{order.id}</span>
                </div>
            </div>

            <main className="container max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
                {/* Order Header Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between shadow-sm">
                    <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-primary-blue text-white flex items-center justify-center shadow-lg shadow-blue-900/10 shrink-0">
                            <Truck className="h-10 w-10 text-primary-orange" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{order.id}</h1>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                    order.status === 'delivered' ? "bg-emerald-100 text-emerald-700" :
                                        order.status === 'shipped' ? "bg-purple-100 text-purple-700" :
                                            "bg-blue-50 text-blue-700"
                                )}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-lg font-bold text-slate-700">{order.vehicleInfo}</p>
                            <p className="text-slate-500 font-medium text-sm flex items-center gap-2 justify-center md:justify-start">
                                <PackageSearch className="h-4 w-4" />
                                {order.parts.join(", ")}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[200px]">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimated Delivery</p>
                        <p className="text-xl font-bold text-slate-900">
                            {new Date(new Date(order.createdAt).getTime() + 439200000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs font-medium text-slate-400">by End of Day</p>
                    </div>
                </div>

                {/* Horizontal Stepper (Landscape Mode) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                        <p className="text-white font-bold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary-orange" />
                            Tracking Timeline
                        </p>
                        <p className="text-slate-400 text-xs">Last Update: {new Date(activeStep.date).toLocaleDateString()}</p>
                    </div>

                    <div className="p-8 md:p-12 overflow-x-auto">
                        <div className="flex items-start justify-between relative min-w-[800px]">
                            {/* Connecting Line */}
                            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -z-0"></div>
                            <div
                                className="absolute top-5 left-0 h-1 bg-primary-orange transition-all duration-1000 -z-0"
                                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                            ></div>

                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isLatest = idx === currentStepIndex;

                                return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center text-center group w-40">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 mb-4 bg-white",
                                            isCompleted
                                                ? "border-primary-orange text-primary-orange shadow-lg shadow-orange-500/20 scale-110"
                                                : "border-slate-200 text-slate-300"
                                        )}>
                                            {isCompleted ? <ShieldCheck className="h-5 w-5 fill-orange-50" /> : <span className="font-bold text-sm">{idx + 1}</span>}
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className={cn(
                                                "text-sm font-bold transition-colors w-full px-2",
                                                isCompleted ? "text-slate-900" : "text-slate-400"
                                            )}>
                                                {step.status}
                                            </h3>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">
                                                {new Date(step.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] text-slate-300">
                                                {new Date(step.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-primary-orange" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Live Location</h3>
                                <p className="text-slate-400">Shipment is currently in transit to the destination port.</p>
                            </div>
                        </div>
                        {/* Fake map visual */}
                        <div className="mt-8 h-32 w-full bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-30">Map Visualization Unavailable in Demo</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col justify-center gap-4">
                        <h3 className="font-bold text-slate-900">Customer Details</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                {order.customerName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{order.customerName}</p>
                                <p className="text-xs text-slate-500">Authorized Receiver</p>
                            </div>
                        </div>
                        <div className="h-px bg-slate-100 my-2" />
                        <Button variant="outline" className="w-full gap-2">
                            <AlertCircle className="h-4 w-4" /> Report Issue
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
