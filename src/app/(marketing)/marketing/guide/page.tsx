'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Search, Truck, CreditCard, ShieldCheck,
    MessageSquare, MousePointerClick, FileText,
    ArrowRight, CheckCircle2, HelpCircle, Package,
    UserCircle, MapPin, DollarSign
} from 'lucide-react'

export default function CustomerGuidePage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container max-w-[1200px] mx-auto px-6 mb-16">
                <Link href="/portal/customer">
                    <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary-orange transition-colors text-primary-blue/60">
                        <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Dashboard
                    </Button>
                </Link>
                <div className="max-w-3xl">
                    <Badge className="mb-6 bg-primary-blue/5 text-primary-blue hover:bg-primary-blue/10 border-none px-4 py-1.5 text-xs font-bold tracking-wide rounded-full uppercase">
                        Customer Handbook
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-primary-blue mb-6 font-display leading-[0.95]">
                        Mastering Your <br />
                        <span className="text-primary-orange">Sourcing Experience.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-primary-blue/60 leading-relaxed font-medium max-w-2xl">
                        A dedicated guide for automotive professionals and individuals. Learn how to source parts, track shipments, and manage payments efficiently.
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="container max-w-[1200px] mx-auto px-6 space-y-24">

                {/* STEP 1: SOURCING */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                        <div className="h-16 w-16 rounded-[2rem] bg-primary-orange/10 flex items-center justify-center text-primary-orange mb-4">
                            <Search className="h-8 w-8" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight text-primary-blue">1. Requesting a Part</h2>
                            <p className="text-primary-blue/70 text-lg leading-relaxed">
                                Our sourcing engine allows you to find specific vehicle parts from our global network.
                            </p>
                        </div>
                        <ul className="space-y-4">
                            {[
                                "Navigate to the '/quote' page.",
                                "Enter your Vehicle VIN or Year/Make/Model.",
                                "Specify the part name (e.g., 'Front Bumper').",
                                "Submit your request to notify our agents."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-primary-blue/5 border border-primary-blue/10">
                                    <div className="h-6 w-6 rounded-full bg-white border border-primary-blue/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary-blue shadow-sm">
                                        {i + 1}
                                    </div>
                                    <span className="text-primary-blue/80 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-4">
                            <Link href="/quote">
                                <Button className="rounded-xl h-12 px-8 bg-primary-orange hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-orange-900/10">
                                    Start a Request <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 bg-slate-50 rounded-[3rem] p-8 md:p-12 aspect-square md:aspect-auto flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary-orange/5" />
                        <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-primary-blue/10 p-6 space-y-4 transform group-hover:scale-105 transition-transform duration-500">
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                <div className="h-10 w-10 bg-primary-orange rounded-full flex items-center justify-center text-white">
                                    <Search className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="h-2 w-24 bg-slate-100 rounded-full mb-2" />
                                    <div className="h-2 w-16 bg-slate-100 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-slate-50 rounded-full" />
                                <div className="h-2 w-3/4 bg-slate-50 rounded-full" />
                                <div className="h-2 w-5/6 bg-slate-50 rounded-full" />
                            </div>
                            <div className="pt-2">
                                <div className="h-10 w-full bg-primary-blue/10 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* STEP 2: NEGOTIATION */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="bg-primary-blue rounded-[3rem] p-8 md:p-12 aspect-square md:aspect-auto flex items-center justify-center relative overflow-hidden group">
                        {/* Abstract Chat UI */}
                        <div className="relative z-10 w-full max-w-sm space-y-4">
                            <div className="flex justify-start">
                                <div className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-white/10">
                                    <p className="text-xs opacity-70 mb-1">Agent</p>
                                    <p className="text-sm font-medium">I found the OEM bumper in excellent condition. Shipping is $150.</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-primary-orange text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-lg">
                                    <p className="text-xs opacity-70 mb-1">You</p>
                                    <p className="text-sm font-medium">That sounds great. Can you send photos?</p>
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 bg-white/20 rounded-lg" />
                                        <div className="h-8 w-8 bg-white/20 rounded-lg" />
                                        <span className="text-xs opacity-70 ml-2">2 photos attached</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                        <div className="h-16 w-16 rounded-[2rem] bg-primary-blue/10 flex items-center justify-center text-primary-blue mb-4">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight text-primary-blue">2. Review & Chat</h2>
                            <p className="text-primary-blue/70 text-lg leading-relaxed">
                                Communicate directly with your assigned agent. Confirm compatibility, negotiate pricing, and review item condition before paying.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <Card className="border-none shadow-lg shadow-primary-blue/5 bg-white">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-primary-orange shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-primary-blue">Real-time Messaging</h4>
                                        <p className="text-sm text-primary-blue/60 mt-1">Chat lives in your dashboard. No need for external apps.</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-lg shadow-primary-blue/5 bg-white">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <DollarSign className="h-6 w-6 text-emerald-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-primary-blue">Transparent Quotes</h4>
                                        <p className="text-sm text-primary-blue/60 mt-1">Receive a full breakdown: Part Cost, Shipping, and Fees.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* STEP 3: TRACKING */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
                        <div className="h-16 w-16 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
                            <Truck className="h-8 w-8" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight text-primary-blue">3. Global Tracking</h2>
                            <p className="text-primary-blue/70 text-lg leading-relaxed">
                                Once paid, your order is shipped immediately. Monitor its journey from our warehouse to your doorstep in real-time.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-primary-blue/5 border border-primary-blue/10">
                                <h4 className="font-bold text-primary-blue mb-4">Tracking States</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-primary-blue/80"><Package className="w-4 h-4 text-primary-blue/40" /> Processing</span>
                                        <span className="text-primary-blue/60">Order confirmed, packing in progress.</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-primary-blue/80"><Truck className="w-4 h-4 text-primary-orange" /> In Transit</span>
                                        <span className="text-primary-blue/60">Handed over to carrier (DHL/FedEx).</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-primary-blue/80"><MapPin className="w-4 h-4 text-green-500" /> Delivered</span>
                                        <span className="text-primary-blue/60">Successfully arrived at destination.</span>
                                    </div>
                                </div>
                            </div>
                            <Link href="/track">
                                <Button variant="outline" className="rounded-xl h-12 px-8 border-primary-blue/20 text-primary-blue hover:bg-primary-blue/5 font-bold uppercase tracking-widest text-xs">
                                    Test Tracking Tool <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 bg-slate-50 rounded-[3rem] p-8 md:p-12 aspect-square md:aspect-auto flex items-center justify-center relative overflow-hidden">
                        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-primary-blue/10 overflow-hidden border border-primary-blue/10">
                            <div className="bg-primary-blue p-4 flex items-center justify-between text-white">
                                <span className="text-xs font-bold uppercase tracking-widest">Tracking Details</span>
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-3 w-3 rounded-full bg-primary-orange" />
                                        <div className="w-0.5 h-12 bg-slate-100" />
                                        <div className="h-3 w-3 rounded-full bg-slate-300" />
                                    </div>
                                    <div className="space-y-8 pt-0.5">
                                        <div>
                                            <p className="font-bold text-primary-blue text-sm">Arrived at Hub</p>
                                            <p className="text-xs text-primary-blue/50">Georgia Distribution Center</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary-blue/40 text-sm">Out for Delivery</p>
                                            <p className="text-xs text-primary-blue/40">Estimated: Tomorrow</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-primary-blue rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-orange/20 rounded-full -ml-12 -mb-12 blur-2xl opacity-50" />
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Ready to get started?</h2>
                        <p className="text-blue-100 text-lg md:text-xl leading-relaxed">
                            Join thousands of satisfied customers who trust Hobort for their automotive sourcing needs.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <Button className="w-full sm:w-auto h-14 px-8 rounded-xl bg-white text-primary-blue hover:bg-white/90 font-bold uppercase tracking-widest text-xs shadow-xl">
                                    Create Account
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs">
                                    Contact Support
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}
