"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Ship, Plane, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { PolicyTabs } from "@/components/marketing/policy-tabs"

export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container max-w-[1400px] mx-auto px-6 py-24">
                <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-blue/30 hover:text-primary-blue transition-colors mb-4">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Hub
                </Link>

                <PolicyTabs />

                <div className="space-y-4 mb-16">
                    <h1 className="text-6xl font-semibold text-primary-blue tracking-tighter uppercase leading-none">
                        Shipping <span className="text-primary-orange">Policy</span>
                    </h1>
                    <p className="text-xl font-medium text-primary-blue/60 max-w-2xl leading-relaxed">
                        Precision logistics from the United States to Ghana. Transparent timelines, secure handling, and real-time tracking.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-primary-blue/5 rounded-3xl p-8 border border-primary-blue/5 group hover:border-primary-blue/20 transition-all">
                        <div className="h-12 w-12 rounded-2xl bg-primary-blue flex items-center justify-center text-white mb-6 shadow-xl shadow-primary-blue/20">
                            <Ship className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-primary-blue mb-4 uppercase tracking-tight">Eco-Sea Freight</h3>
                        <p className="text-sm font-medium text-primary-blue/60 leading-relaxed mb-6">
                            Best for heavy components, engines, or bulk inventory shipments. Cost-optimized for major volume.
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-primary-blue">
                                <Clock className="h-3 w-3 text-primary-orange" /> 45 - 60 Business Days
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-primary-blue">
                                <MapPin className="h-3 w-3 text-primary-orange" /> Tema / Takoradi Ports
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary-orange/5 rounded-3xl p-8 border border-primary-orange/5 group hover:border-primary-orange/20 transition-all">
                        <div className="h-12 w-12 rounded-2xl bg-primary-orange flex items-center justify-center text-white mb-6 shadow-xl shadow-primary-orange/20">
                            <Plane className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-primary-blue mb-4 uppercase tracking-tight">Priority Air Freight</h3>
                        <p className="text-sm font-medium text-primary-blue/60 leading-relaxed mb-6">
                            Express delivery for critical repairs and high-value components. Door-to-Door tracking included.
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-primary-blue">
                                <Clock className="h-3 w-3 text-primary-orange" /> 7 - 14 Business Days
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-primary-blue">
                                <MapPin className="h-3 w-3 text-primary-orange" /> Kotoka Int. Airport
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-12 mb-24">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-primary-blue uppercase tracking-tight flex items-center gap-4">
                            <span className="h-1.5 w-8 bg-primary-orange rounded-full" />
                            Order Processing
                        </h2>
                        <div className="pl-12 space-y-4 text-sm font-medium text-primary-blue/70 leading-relaxed">
                            <p>
                                Orders are processed within我們的 Georgia Export Hub in Lawrenceville, GA. Standard verification for OEM or Used parts takes 24-48 hours before shipment dispatch.
                            </p>
                            <p>
                                Once dispatched, users receive a unique Tracking ID (e.g., HB-1234) which can be used on our main dashboard or mobile app for real-time status updates.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-primary-blue uppercase tracking-tight flex items-center gap-4">
                            <span className="h-1.5 w-8 bg-primary-orange rounded-full" />
                            Import Duties & Customs
                        </h2>
                        <div className="pl-12 space-y-4 text-sm font-medium text-primary-blue/70 leading-relaxed">
                            <p>
                                Hobort provides a comprehensive "Landed Cost" estimate. This includes US sourcing, logistics, and Ghana customs clearance.
                            </p>
                            <p>
                                Any additional regional taxes or port handling fees not covered in the original quote will be communicated to the client before the "Ready for Pickup" status is activated.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-primary-blue uppercase tracking-tight flex items-center gap-4">
                            <span className="h-1.5 w-8 bg-primary-orange rounded-full" />
                            Pickup Locations
                        </h2>
                        <div className="pl-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-semibold text-primary-orange uppercase tracking-widest mb-2">Main Hub</p>
                                <p className="text-primary-blue font-medium">Accra Pickup Center</p>
                                <p className="text-[10px] text-primary-blue/40 uppercase font-semibold">Sakumono Area, Accra</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 opacity-50">
                                <p className="text-[10px] font-semibold text-primary-blue/30 uppercase tracking-widest mb-2">Secondary Hub</p>
                                <p className="text-primary-blue font-medium">Tema Port Annex</p>
                                <p className="text-[10px] text-primary-blue/40 uppercase font-semibold">Tema Industrial Area</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-blue rounded-3xl p-12 text-center space-y-6 shadow-2xl shadow-primary-blue/20">
                    <h2 className="text-3xl font-semibold text-white uppercase tracking-tight">Need urgent sourcing?</h2>
                    <p className="text-blue-100/60 font-medium max-w-md mx-auto">
                        Our US-based logistics team is active 24/7 to ensure your parts move fast across the Atlantic.
                    </p>
                    <div className="pt-4">
                        <Link href="/contact">
                            <Button className="bg-white text-primary-blue hover:bg-blue-50 font-semibold px-12 h-14 rounded-xl uppercase tracking-widest text-[10px]">
                                Contact Logistics Team
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
