"use client"

import { ShieldCheck, MapPin, Truck, ChevronRight, AlertCircle, Search, PackageSearch, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import * as React from "react"
import { useState, useEffect } from "react"

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: trackingId } = React.use(params)
    const [shipment, setShipment] = useState<any>(null)
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchTrackingData() {
            try {
                setLoading(true)
                const { data, error: shipmentError } = await supabase
                    .from('shipments')
                    .select('*, orders(*, profiles(*))')
                    .eq('tracking_number', trackingId)
                    .single()

                if (shipmentError || !data) {
                    throw new Error("Shipment not found")
                }

                setShipment(data)

                const { data: eventData } = await supabase
                    .from('shipment_events')
                    .select('*')
                    .eq('shipment_id', data.id)
                    .order('occurred_at', { ascending: true })

                setEvents(eventData || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchTrackingData()
    }, [trackingId])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-primary-orange animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse uppercase tracking-widest text-xs">Locating Shipment...</p>
            </div>
        )
    }

    if (error || !shipment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
                <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center shadow-inner">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-900">Shipment Not Found</h1>
                    <p className="text-slate-500 max-w-md">We couldn&apos;t find an active shipment with ID <span className="font-mono font-semibold text-slate-900 border-b-2 border-primary-orange/20">{trackingId}</span>.</p>
                </div>
                <Link href="/">
                    <Button variant="outline" className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50">
                        <Search className="h-4 w-4" /> Try Another Search
                    </Button>
                </Link>
            </div>
        )
    }

    const order = shipment.orders
    const customer = order?.profiles

    // Map shipment status to progress index
    const statusMap: Record<string, number> = {
        'received_at_hub': 0,
        'in_transit_air': 1,
        'in_transit_sea': 1,
        'clearing_customs': 2,
        'ready_for_pickup': 3,
        'delivered': 4
    }

    const currentStepIndex = statusMap[shipment.status] ?? 0

    const steps = [
        { label: "Received at Hub", icon: ShieldCheck },
        { label: "In Transit", icon: Truck },
        { label: "Clearing Customs", icon: PackageSearch },
        { label: "Ready for Pickup", icon: MapPin },
        { label: "Delivered", icon: CheckCircle2 }
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="container max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Link href="/" className="hover:text-primary-blue transition-colors font-bold uppercase tracking-widest text-[10px]">
                            Home
                        </Link>
                        <ChevronRight className="h-3 w-3 text-slate-300" />
                        <span className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Track Shipment</span>
                    </div>
                    <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Live Connection</span>
                    </div>
                </div>
            </div>

            <main className="container max-w-[1400px] mx-auto px-6 py-12 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-100 pb-12">
                    <div className="space-y-4">
                        <Badge className="bg-primary-orange/10 text-primary-orange border-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest mb-2">
                            Active Shipment
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-black text-primary-blue tracking-tighter">
                            {trackingId}
                        </h1>
                        <div className="flex items-center gap-6">
                            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-black text-primary-blue uppercase tracking-tight">
                                    {shipment.status.replace(/_/g, ' ')}
                                </p>
                            </div>
                            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Freight Type</p>
                                <p className="text-sm font-black text-primary-blue uppercase tracking-tight">
                                    {shipment.freight_type}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary-blue text-white p-8 rounded-2xl min-w-[300px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Estimated Delivery</p>
                        <p className="text-3xl font-black mb-1">
                            {shipment.estimated_arrival ? new Date(shipment.estimated_arrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                        </p>
                        <p className="text-[10px] font-bold text-primary-orange uppercase tracking-widest">Tema Port Hub Arrival</p>
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary-orange" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary-blue">Journey Progress</h2>
                    </div>

                    <div className="relative pt-4 pb-12 overflow-x-auto scrollbar-hide">
                        <div className="flex justify-between items-start min-w-[800px] relative px-4">
                            {/* Connector Line */}
                            <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-slate-100 -z-0" />
                            <div
                                className="absolute top-6 left-[10%] h-[2px] bg-primary-orange transition-all duration-1000 -z-0"
                                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 80}%` }}
                            />

                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const StepIcon = step.icon;

                                return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center group w-40">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 mb-4",
                                            isCompleted
                                                ? "bg-white border-primary-orange text-primary-orange shadow-lg shadow-orange-100 scale-110"
                                                : "bg-slate-50 border-slate-100 text-slate-300"
                                        )}>
                                            <StepIcon className="h-5 w-5" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <h3 className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest transition-colors",
                                                isCompleted ? "text-primary-blue" : "text-slate-400"
                                            )}>
                                                {step.label}
                                            </h3>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Timeline and Details Side-by-Side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary-orange" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-primary-blue">Milestone Updates</h2>
                        </div>

                        <div className="space-y-6">
                            {events.length > 0 ? (
                                events.map((event, idx) => (
                                    <div key={idx} className="flex gap-6 relative group">
                                        {idx !== events.length - 1 && (
                                            <div className="absolute left-[9px] top-6 bottom-0 w-px bg-slate-100 group-hover:bg-primary-orange/20 transition-colors" />
                                        )}
                                        <div className="h-5 w-5 rounded-full border-2 border-primary-orange bg-white shrink-0 mt-1 relative z-10" />
                                        <div className="space-y-1 border-b border-slate-50 pb-6 w-full">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-black text-primary-blue uppercase tracking-tight">
                                                    {event.location}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {new Date(event.occurred_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initial journey logging pending...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary-blue">Consignee Info</h3>
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-primary-blue text-xl">
                                    {customer?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="font-black text-primary-blue text-lg leading-none mb-1">
                                        {customer?.full_name || 'HAPE Customer'}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Receiver</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-200/50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                                <p className="text-sm font-bold text-primary-blue">{customer?.country || 'Ghana'}</p>
                            </div>
                            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-xs font-bold uppercase tracking-widest hover:bg-white">
                                <AlertCircle className="h-4 w-4 mr-2" /> Report Issue
                            </Button>
                        </div>

                        <div className="p-8 bg-primary-blue/5 rounded-2xl border border-primary-blue/10">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary-blue mb-4">Support Link</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                                Need direct assistance with your shipment? Connect with your dedicated HAPE logistics agent.
                            </p>
                            <Link href="/contact" className="inline-flex items-center gap-2 text-primary-orange font-bold uppercase tracking-widest text-[10px] hover:gap-3 transition-all">
                                Open Inquiry <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
            {children}
        </span>
    )
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    )
}

function CheckCircle2({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
