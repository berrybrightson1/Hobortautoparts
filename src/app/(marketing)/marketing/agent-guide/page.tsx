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
    UserCircle, MapPin, DollarSign, PackageSearch,
    TrendingUp, ShoppingBag
} from 'lucide-react'

export default function AgentGuidePage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            {/* Header Section */}
            <div className="container max-w-[1200px] mx-auto px-6 mb-16">
                <Link href="/portal/agent">
                    <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary-orange transition-colors text-primary-blue/60">
                        <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Sourcing Pipeline
                    </Button>
                </Link>
                <div className="max-w-3xl">
                    <Badge className="mb-6 bg-primary-blue/5 text-primary-blue hover:bg-primary-blue/10 border-none px-4 py-1.5 text-xs font-bold tracking-wide rounded-full uppercase">
                        Agent Handbook
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-primary-blue mb-6 font-display leading-[0.95]">
                        Powering Global <br />
                        <span className="text-primary-orange">Logistics & Sales.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-primary-blue/60 leading-relaxed font-medium max-w-2xl">
                        The ultimate resource for Sourcing Agents. Learn how to manage requests, generate quotes, and oversee the entire fulfillment lifecycle.
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="container max-w-[1200px] mx-auto px-6 space-y-24">

                {/* STEP 1: SOURCING PIPELINE */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                        <div className="h-16 w-16 rounded-2xl bg-primary-orange/10 flex items-center justify-center text-primary-orange mb-4">
                            <PackageSearch className="h-8 w-8" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight text-primary-blue">1. The Sourcing Pipeline</h2>
                            <p className="text-primary-blue/70 text-lg leading-relaxed">
                                Your command center. View incoming part requests from customers in real-time and claim the ones you can fulfill.
                            </p>
                        </div>
                        <ul className="space-y-4">
                            {[
                                "Access the 'Sourcing Pipeline' from your Agent Dashboard.",
                                "Review vehicle details (VIN, Make, Model) and part requirements.",
                                "Check 'Active' requests that need immediate attention.",
                                "Use the 'Sourcing' status to indicate you are finding parts.",
                                "Admins can see your activity live via matching unread badges."
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
                            <Link href="/portal/agent">
                                <Button className="rounded-xl h-12 px-8 bg-primary-orange hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-orange-900/10">
                                    Go to Pipeline <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 bg-slate-50 rounded-2xl p-8 md:p-12 aspect-square md:aspect-auto flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary-orange/5" />
                        <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-primary-blue/10 p-6 space-y-4 transform group-hover:scale-105 transition-transform duration-500">
                            <div className="flex justify-between items-center border-b border-primary-blue/10 pb-4">
                                <span className="text-[10px] font-bold text-primary-blue uppercase tracking-widest">New Requests</span>
                                <Badge className="bg-orange-500 text-white border-none py-0.5">3 Active</Badge>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                                    <div className="h-10 w-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 w-24 bg-slate-200 rounded-full mb-2" />
                                        <div className="h-2 w-16 bg-slate-100 rounded-full" />
                                    </div>
                                </div>
                                <div className="p-3 bg-white rounded-xl border border-primary-orange shadow-lg shadow-orange-500/10 flex gap-3 transform scale-105">
                                    <div className="h-10 w-10 bg-primary-orange rounded-lg flex items-center justify-center text-white">
                                        <Search className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-primary-blue">2018 Honda Civic</p>
                                        <p className="text-[10px] text-primary-blue/60">Front Bumper • Turbo</p>
                                    </div>
                                    <Button size="sm" className="h-8 bg-primary-blue text-white text-[10px]">Claim</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* STEP 2: QUOTING */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="bg-primary-blue rounded-2xl p-8 md:p-12 aspect-square md:aspect-auto flex items-center justify-center relative overflow-hidden group">
                        {/* Abstract Quote UI */}
                        <div className="relative z-10 w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-6">
                            <div className="space-y-2 text-center text-white">
                                <h3 className="text-xl font-bold">Generate Quote</h3>
                                <p className="text-xs opacity-70">Calculated symmetrically</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-white/80 text-sm">
                                    <span>Part Cost</span>
                                    <span>$450.00</span>
                                </div>
                                <div className="flex justify-between text-white/80 text-sm">
                                    <span>Shipping</span>
                                    <span>$120.00</span>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="flex justify-between text-white font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary-orange">$570.00</span>
                                </div>
                            </div>
                            <Button className="w-full bg-primary-orange hover:bg-orange-600 text-white font-bold h-12 rounded-xl">
                                Send to Customer
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                        <div className="h-16 w-16 rounded-2xl bg-primary-blue/10 flex items-center justify-center text-primary-blue mb-4">
                            <DollarSign className="h-8 w-8" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight text-primary-blue">2. Smart Quoting</h2>
                            <p className="text-primary-blue/70 text-lg leading-relaxed">
                                Build trusted relationships with transparent pricing. Our system handles calculations so you can focus on the deal.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <Card className="border-none shadow-lg shadow-primary-blue/5 bg-white">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <MessageSquare className="h-6 w-6 text-primary-orange shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-primary-blue">Direct Chat</h4>
                                        <p className="text-sm text-primary-blue/60 mt-1">Upload photos and confirm part condition directly within the quote thread.</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-lg shadow-primary-blue/5 bg-white">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-primary-blue">Secure Approval</h4>
                                        <p className="text-sm text-primary-blue/60 mt-1">Customers accept and pay securely. You get notified instantly.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* STEP 3: ORDERS & FULFILLMENT */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight text-primary-blue">3. Order Fulfillment</h2>
                            <p className="text-primary-blue/70 text-lg leading-relaxed">
                                Move from 'Paid' to 'Shipped'. Generate tracking numbers and manage logistics partners from the Orders panel.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-primary-blue/5 border border-primary-blue/10">
                                <h4 className="font-bold text-primary-blue mb-4">Agent Actions</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-primary-blue/80"><CheckCircle2 className="w-4 h-4 text-green-500" /> Verify Payment</span>
                                        <span className="text-primary-blue/60">Ensure funds are cleared.</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-primary-blue/80"><Package className="w-4 h-4 text-primary-orange" /> Initiate Shipping</span>
                                        <span className="text-primary-blue/60">Contact logistics provider.</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-primary-blue/80"><Truck className="w-4 h-4 text-indigo-500" /> Add Tracking</span>
                                        <span className="text-primary-blue/60">Update customer with Ref ID.</span>
                                    </div>
                                </div>
                            </div>
                            <Link href="/portal/agent/orders">
                                <Button variant="outline" className="rounded-xl h-12 px-8 border-primary-blue/20 text-primary-blue hover:bg-primary-blue/5 font-bold uppercase tracking-widest text-xs">
                                    View Active Orders <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 bg-slate-50 rounded-2xl p-8 md:p-12 aspect-square md:aspect-auto flex items-center justify-center relative overflow-hidden">
                        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-primary-blue/10 overflow-hidden border border-primary-blue/10">
                            <div className="bg-primary-blue p-4 flex items-center justify-between text-white">
                                <span className="text-xs font-bold uppercase tracking-widest">Performance Stats</span>
                                <TrendingUp className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl text-center">
                                    <p className="text-2xl font-bold text-primary-blue">12</p>
                                    <p className="text-[10px] uppercase font-bold text-primary-blue/40 tracking-wider">Completed</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-2xl text-center">
                                    <p className="text-2xl font-bold text-primary-orange">$4.2k</p>
                                    <p className="text-[10px] uppercase font-bold text-primary-orange/60 tracking-wider">Revenue</p>
                                </div>
                                <div className="col-span-2 p-4 bg-primary-blue/5 rounded-2xl flex items-center justify-between">
                                    <span className="text-xs font-bold text-primary-blue">Rating</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-2 w-2 rounded-full bg-primary-orange" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-primary-blue rounded-2xl p-12 md:p-24 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-orange/20 rounded-full -ml-12 -mb-12 blur-2xl opacity-50" />
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Need Agent Assistance?</h2>
                        <p className="text-blue-100 text-lg md:text-xl leading-relaxed">
                            Contact the administration team for support with disputes, payouts, or technical issues.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/contact">
                                <Button className="w-full sm:w-auto h-14 px-8 rounded-xl bg-white text-primary-blue hover:bg-white/90 font-bold uppercase tracking-widest text-xs shadow-xl">
                                    Contact Admin
                                </Button>
                            </Link>
                        </div>
                        {/* STEP 4: PERFORMANCE CENTRAL */}
                        <section className="grid md:grid-cols-1 gap-12 items-center">
                            <Card className="border-slate-100 shadow-2xl rounded-2xl bg-white overflow-hidden">
                                <CardContent className="p-12 flex flex-col md:flex-row items-center gap-12">
                                    <div className="h-24 w-24 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <TrendingUp className="h-12 w-12" />
                                    </div>
                                    <div className="space-y-4 text-center md:text-left">
                                        <h3 className="text-3xl font-bold tracking-tight text-primary-blue">Performance Central</h3>
                                        <p className="text-primary-blue/70 text-lg leading-relaxed max-w-2xl">
                                            Admins now monitor sourcing speed and resolution rates in real-time. Use the **Agent Performance Hub** to track your metrics, completed orders, and global rating within the Hobort network.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                    </div>
                </section>

            </div>
        </div>
    )
}
