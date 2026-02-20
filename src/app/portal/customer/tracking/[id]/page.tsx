'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Truck, MapPin, Calendar, Package, Loader2, AlertCircle } from 'lucide-react'
import { ShipmentTimeline } from '@/components/portal/shipment-timeline'
import { format } from 'date-fns'
import { CardSkeleton } from '@/components/portal/skeletons'

export default function ShipmentDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [shipment, setShipment] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchShipment = async () => {
            setIsLoading(true)
            try {
                const { data, error } = await supabase
                    .from('shipments')
                    .select(`
                        *,
                        orders (
                            id,
                            quotes (
                                sourcing_requests (part_name, vehicle_info)
                            )
                        )
                    `)
                    .eq('id', params.id)
                    .single()

                if (error) throw error
                setShipment(data)
            } catch (err: any) {
                console.error("Error loading shipment:", err)
                setError(err.message || "Failed to load shipment details")
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            fetchShipment()
        }
    }, [params.id])

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 mt-10">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <CardSkeleton />
                    </div>
                    <div>
                        <CardSkeleton />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !shipment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="h-20 w-20 bg-red-50 rounded-2xl flex items-center justify-center shadow-sm border border-red-100">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Shipment Not Found</h2>
                    <p className="text-slate-500 mt-2">The tracking ID may be invalid or the shipment doesn't exist.</p>
                </div>
                <Button onClick={() => router.back()} variant="outline" className="rounded-xl px-8 h-12">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        )
    }

    const vehicleInfo = shipment.orders?.quotes?.sourcing_requests?.vehicle_info
    const partName = shipment.orders?.quotes?.sourcing_requests?.part_name

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="pl-0 hover:bg-transparent hover:text-primary-blue text-slate-500 mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tracking
                </Button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                                Shipment #{shipment.tracking_number}
                            </h1>
                            <Badge className="bg-blue-50 text-blue-600 border-none shadow-sm uppercase tracking-widest text-[10px] px-3 py-1 whitespace-nowrap">
                                {shipment.status?.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                        <p className="text-lg text-slate-500 font-medium pt-1">
                            {partName} - {vehicleInfo}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column - Tracking Timeline */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                            <CardTitle className="flex items-center gap-3 text-lg text-slate-900">
                                <Truck className="h-5 w-5 text-primary-blue" />
                                Shipment Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <ShipmentTimeline events={shipment.events || []} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                    <Card className="border-slate-100 shadow-lg shadow-slate-200/20 rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Logistics Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                        <MapPin className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Origin</p>
                                        <p className="text-sm font-semibold text-slate-900">{shipment.origin_hub}</p>
                                    </div>
                                </div>
                                <div className="ml-5 border-l-2 border-dashed border-slate-200 h-6" />
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                        <MapPin className="h-5 w-5 text-primary-blue" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Destination</p>
                                        <p className="text-sm font-semibold text-slate-900">{shipment.destination_hub}</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Calendar className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Expected Delivery</p>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {shipment.estimated_delivery
                                                ? format(new Date(shipment.estimated_delivery), 'MMM dd, yyyy')
                                                : 'Pending Estimate'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Package className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Carrier</p>
                                        <p className="text-sm font-semibold text-slate-900">{shipment.carrier || 'Hobort Express'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary-blue text-white rounded-2xl shadow-xl shadow-primary-blue/30 border-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <CardContent className="p-8 space-y-4 relative z-10">
                            <h3 className="font-semibold text-lg">Need Assistance?</h3>
                            <p className="text-white/80 text-sm font-medium">
                                If you have questions about your shipment, our support team has direct access to carrier updates.
                            </p>
                            <Button
                                onClick={() => router.push(`/contact?ref=${shipment.tracking_number}`)}
                                variant="outline"
                                className="w-full bg-white text-primary-blue hover:bg-white/90 font-bold uppercase tracking-widest text-xs h-12 rounded-xl"
                            >
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
