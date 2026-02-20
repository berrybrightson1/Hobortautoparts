"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, ShieldCheck, Zap, Truck, Package, Target, Layers, DollarSign, Clock, Search, MapPin, Gauge } from "lucide-react"
import { motion } from "framer-motion"

export default function AboutPage() {
    return (
        <div className="flex flex-col pt-24 pb-12 overflow-hidden bg-white">
            {/* Minimal Hero - Tighter spacing, reduced font size */}
            <section className="container max-w-[1400px] mx-auto px-6 text-center mb-20 relative">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mb-6 ring-1 ring-slate-100">
                        Reliability is our Standard
                    </div>
                    <h1 className="text-4xl md:text-6xl font-semibold text-primary-blue tracking-tighter leading-tight uppercase mb-6">
                        SAVE MORE. DRIVE <span className="text-primary-orange">FASTER.</span> <br />
                        SPEND <span className="text-primary-blue/30">SMARTER.</span>
                    </h1>
                    <p className="text-base text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
                        The definitive intercontinental supply chain bridge, connecting Ghanaian vehicle owners directly to authentic U.S. automotive sources.
                    </p>
                </motion.div>
            </section>

            {/* Value Highlights - Compact Grid */}
            <section className="container max-w-[1400px] mx-auto px-6 mb-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: "Direct Sourcing", desc: "No middlemen. Direct access to U.S. OEM dealerships and warehouses.", icon: Target, color: "text-primary-orange", bg: "bg-orange-50" },
                        { title: "Verified Hubs", desc: "Rigorous quality auditing at our Georgia logistics center.", icon: ShieldCheck, color: "text-primary-blue", bg: "bg-blue-50" },
                        { title: "Express Freight", desc: "Optimized air and sea routes ensuring 3–7 day arrival.", icon: Truck, color: "text-green-600", bg: "bg-green-50" },
                        { title: "VIN Precision", desc: "Advanced technical matching ensures 100% compatibility.", icon: Gauge, color: "text-purple-600", bg: "bg-purple-50" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
                        >
                            <div className={`h-12 w-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold text-primary-blue mb-2 uppercase tracking-tight">{item.title}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Core Problem - Compact Glassmorphic Section */}
            <section className="container max-w-[1400px] mx-auto px-6 mb-24 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto rounded-2xl bg-primary-blue p-8 md:p-16 relative overflow-hidden text-white"
                >
                    <div className="relative z-10 grid lg:grid-cols-5 gap-12 items-center">
                        <div className="lg:col-span-3 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                <Search className="h-3 w-3" /> The Core Problem
                            </div>
                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight uppercase">
                                Stuck at the <span className="text-primary-orange">Mechanic?</span>
                            </h2>
                            <p className="text-lg text-blue-100/70 font-medium leading-relaxed">
                                Many cars in Ghana remain stuck at mechanic shops for weeks because parts are either unavailable or overpriced.
                            </p>
                        </div>
                        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-4">
                            <h3 className="text-xl font-bold tracking-tight uppercase italic leading-tight">"YOU GET THE EXACT PART. GENUINE QUALITY. DELIVERY WITHIN DAYS."</h3>
                            <p className="text-blue-100/40 text-[11px] font-medium leading-relaxed">
                                We bypass local delays and inflated costs by connecting you directly to verified U.S. sources.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Offering Grid - Minimal Technical Layout */}
            <section className="container max-w-[1400px] mx-auto px-6 mb-24">
                <div className="flex justify-between items-end gap-10 mb-12 border-b border-slate-100 pb-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-semibold text-primary-blue tracking-tighter uppercase">Product & Service <span className="text-primary-orange">Catalog.</span></h2>
                        <p className="text-xs text-slate-500 font-medium">Comprehensive intercontinental parts inventory support.</p>
                    </div>
                    <span className="text-3xl font-black text-slate-100 hidden sm:block">01</span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1 bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                    {[
                        { title: "Major Brand OEM", desc: "Toyota, Honda, Ford, Nissan, Mercedes, BMW, Kia, Hyundai.", icon: Target },
                        { title: "Verified Aftermarket", desc: "Bosch, Dorman, ACDelco, Monroe, and elite certified brands.", icon: Layers },
                        { title: "Mechanical Units", desc: "Engines (New & Used), Transmissions, Gearboxes.", icon: Zap },
                        { title: "Critical Control", desc: "Sensors, Pumps, Modules, AC Compressors, Cooling.", icon: ShieldCheck },
                        { title: "Suspension & Body", desc: "Shock Absorbers, Fenders, Bumpers, Doors, Lights.", icon: Package },
                        { title: "Fleet Solutions", desc: "Bulk procurement and priority support for professional fleets.", icon: Layers }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-8 group hover:bg-slate-50 transition-colors">
                            <item.icon className="h-6 w-6 text-primary-orange mb-4 group-hover:scale-105 transition-transform" />
                            <h3 className="text-sm font-bold text-primary-blue mb-2 uppercase tracking-tight leading-none">{item.title}</h3>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Combined Process & Options - Side by Side */}
            <section className="bg-slate-50 py-16 mb-24 border-y border-slate-100">
                <div className="container max-w-[1400px] mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 max-w-6xl mx-auto">
                        {/* 7-Step Process Compact */}
                        <div className="space-y-10">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-primary-blue tracking-tighter uppercase">Our 7-Step Process</h2>
                                <div className="h-1 w-12 bg-primary-orange rounded-full" />
                            </div>
                            <div className="space-y-4">
                                {[
                                    "Send VIN or part request.",
                                    "Hobort verifies and identifies exact part.",
                                    "Receive full quote (U.S. cost + shipping).",
                                    "Approve the order.",
                                    "Hobort purchases from U.S. supplier.",
                                    "Shipping in 3–7 business days.",
                                    "Mechanic installs the part."
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <span className="text-xl font-black text-slate-200 group-hover:text-primary-orange transition-colors shrink-0 font-mono italic">0{i + 1}</span>
                                        <p className="text-sm font-semibold text-primary-blue uppercase tracking-tight">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Options Compact */}
                        <div className="space-y-10">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-primary-blue tracking-tighter uppercase">Shipping Options</h2>
                                <div className="h-1 w-12 bg-primary-orange rounded-full" />
                            </div>
                            <div className="grid gap-4">
                                {[
                                    { title: "Express Air Freight", desc: "Fastest path from the U.S. source.", icon: Zap },
                                    { title: "Weekly Consolidation", desc: "Best value pricing for your budget.", icon: Clock },
                                    { title: "Hub-to-Door Tracking", desc: "Visibility from US Hub to your bay.", icon: MapPin }
                                ].map((option, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200">
                                        <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                            <option.icon className="h-4 w-4 text-primary-orange" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary-blue uppercase tracking-tight mb-0.5">{option.title}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{option.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 rounded-2xl bg-primary-orange text-white text-center shadow-lg shadow-primary-orange/20">
                                <h3 className="text-md font-bold italic">"SAVE MORE. DRIVE FASTER. SPEND SMARTER."</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strategy & Targets - Minimal Layout */}
            <section className="container max-w-[1400px] mx-auto px-6 mb-24">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-semibold text-primary-blue tracking-tighter uppercase leading-tight">Strategic <br /><span className="text-primary-orange">Advantages.</span></h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                { title: "30-50% Savings", desc: "U.S. pricing vs. Ghana rates.", icon: DollarSign },
                                { title: "10% Online Hub Hub", desc: "Exclusive portal portal discount.", icon: Zap },
                                { title: "Real-Time GPS", desc: "Monitor Hub Hub to door door.", icon: Truck },
                                { title: "Genuine Quality", desc: "Zero counterfeit counterfeit risk risk.", icon: ShieldCheck }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start group">
                                    <item.icon className="h-4 w-4 text-primary-orange mt-1 shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-primary-blue uppercase tracking-tight mb-1">{item.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                        <h2 className="text-xs font-bold text-primary-orange uppercase tracking-[0.2em]">Target Customers</h2>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                            {[
                                "Auto Workshops",
                                "Corporate Fleets",
                                "Spare Parts Shops",
                                "Ride-Hailing Drivers",
                                "Independent Owners",
                                "Body Shop Specialists"
                            ].map((target, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary-blue/30" />
                                    <span className="text-[10px] font-bold text-primary-blue uppercase tracking-tight">{target}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <Link href="/quote" className="block">
                                <Button variant="orange" size="sm" className="w-full h-10 rounded-xl text-xs font-bold shadow-md">
                                    Start Sourcing Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
