"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Search, Package, ShieldCheck, Truck, MessageSquare, Zap, ArrowRight, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function PlatformGuidePage() {
    const steps = [
        {
            title: "1. Create Sourcing Request",
            desc: "Provide your vehicle's VIN and the part description. Our global network begins a real-time audit for your component.",
            icon: Search,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "2. Real-time Negotiation",
            desc: "Expert agents source the best deals. You'll receive a professional quote including item price and logistics costs.",
            icon: MessageSquare,
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            title: "3. Secure Acceptance",
            desc: "Accept the quote to lock in the price. Your order is instantly generated and moved to the fulfillment pipeline.",
            icon: ShieldCheck,
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        },
        {
            title: "4. Global Fulfillment",
            desc: "We handle the logistics. Track your part's journey from our international hubs directly to your doorstep.",
            icon: Truck,
            color: "text-orange-500",
            bg: "bg-orange-50"
        }
    ]

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto pt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">
                    <BookOpen className="h-3 w-3" /> Educational Resource
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">
                    Master the <span className="text-primary-orange">Hobort</span> Ecosystem.
                </h1>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    Learn how our global sourcing network connects you to the world's most elusive vehicle components.
                </p>
            </div>

            {/* Stepper Layout */}
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                {steps.map((step, i) => (
                    <Card key={i} className="group border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white ring-1 ring-slate-100/50 overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <CardContent className="p-10 space-y-6">
                            <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500", step.bg, step.color)}>
                                <step.icon className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold tracking-tight text-slate-900">{step.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* FAQ / Support Section */}
            <Card className="border-none bg-slate-900 rounded-[3rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-blue/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px]" />

                <CardContent className="relative z-10 p-12 md:p-20 text-center space-y-8">
                    <div className="h-20 w-20 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-6 ring-1 ring-white/20">
                        <HelpCircle className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold text-white tracking-tight">Still have questions?</h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
                            Our team of automotive logistics experts is available 24/7 to assist with complex sourcing needs.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-white text-slate-900 font-bold uppercase tracking-widest text-xs hover:bg-primary-orange hover:text-white transition-all">
                            Chat with Support
                        </Button>
                        <Button variant="ghost" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-white font-bold uppercase tracking-widest text-xs border border-white/10 hover:bg-white/5">
                            Read Full Terms
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Pro Tips */}
            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { title: "VIN Accuracy", text: "Providing a clear VIN photo reduces sourcing time by up to 40%.", icon: Zap },
                    { title: "Global Hubs", text: "Switch between air and sea freight during the negotiation stage.", icon: Truck },
                    { title: "Verified Parts", text: "Every part undergoes a 5-point quality audit before shipping.", icon: ShieldCheck }
                ].map((tip, i) => (
                    <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                        <tip.icon className="h-6 w-6 text-slate-400" />
                        <h4 className="text-lg font-bold text-slate-900">{tip.title}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{tip.text}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
