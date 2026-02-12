"use client"

import { motion } from "framer-motion"
import { Search, ShieldCheck, ShoppingCart, Truck, PackageCheck, ArrowRight, MessageCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const STEPS = [
    {
        title: "Request",
        description: "Submit your part details via our WhatsApp-linked form or the Hub. Provide your VIN for 100% compatibility matching.",
        icon: MessageCircle,
        color: "text-emerald-500",
        bg: "bg-emerald-50"
    },
    {
        title: "Quote",
        description: "Receive a comprehensive, transparent invoice including item cost, shipping estimates, and service fees.",
        icon: FileText,
        color: "text-primary-blue",
        bg: "bg-blue-50"
    },
    {
        title: "Acquisition",
        description: "We handle the secure procurement from trusted US auctions, suppliers, and dealerships at competitive rates.",
        icon: ShoppingCart,
        color: "text-primary-orange",
        bg: "bg-orange-50"
    },
    {
        title: "Verification",
        description: "Our US-based agents physically audit parts and verify vendor reputation before shipping to Ghana.",
        icon: ShieldCheck,
        color: "text-purple-600",
        bg: "bg-purple-50"
    },
    {
        title: "Shipment",
        description: "Fast clearing and final delivery. Pick up at our Sakumono center or take advantage of our doorstep delivery service.",
        icon: Truck,
        color: "text-green-600",
        bg: "bg-green-50"
    }
]

export default function HowItWorksPage() {
    return (
        <div className="flex flex-col pt-32 pb-20 overflow-hidden">
            {/* Hero Section */}
            <section className="container mx-auto px-4 md:px-8 text-center mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl md:text-7xl font-semibold text-primary-blue tracking-tight leading-[1.1] uppercase">
                        How it <span className="text-primary-orange">Works</span>
                    </h1>
                    <p className="mt-8 text-xl text-slate-500 leading-relaxed font-medium">
                        The most transparent way to source genuine parts directly from the United States.
                        A systematic 5-step journey built on integrity.
                    </p>
                </motion.div>
            </section>

            {/* Journey Section */}
            <section className="container mx-auto px-4 md:px-8 max-w-6xl relative">
                {/* Connecting Line (Vertical on mobile, Horizontal/Curved on desktop if needed, simplified here) */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 hidden md:block" />

                <div className="space-y-24 relative">
                    {STEPS.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className={`flex flex-col md:flex-row items-center gap-12 ${index % 2 !== 0 ? "md:flex-row-reverse" : ""
                                }`}
                        >
                            {/* Icon Container */}
                            <div className="w-full md:w-1/2 flex justify-center">
                                <div className={`relative h-48 w-48 rounded-[3rem] ${step.bg} flex items-center justify-center shadow-premium group transform transition-transform hover:rotate-3`}>
                                    <step.icon className={`h-20 w-20 ${step.color} transition-transform group-hover:scale-110`} />
                                    <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xl font-bold text-primary-blue">
                                        {index + 1}
                                    </div>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="w-full md:w-1/2 text-center md:text-left space-y-4">
                                <h3 className="text-3xl font-semibold text-primary-blue uppercase tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                    {step.description}
                                </p>
                                {index === 0 && (
                                    <Link href="/quote" className="inline-block mt-4">
                                        <Button className="rounded-full bg-primary-orange hover:bg-orange-600 text-white font-semibold flex items-center gap-2 pr-6">
                                            Start Your Request <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="mt-32 py-24 bg-primary-blue text-white relative overflow-hidden">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter uppercase mb-8">
                        Ready to begin your <span className="text-primary-orange">Scout?</span>
                    </h2>
                    <p className="text-blue-100/60 max-w-2xl mx-auto text-lg font-medium mb-12">
                        Whether you're a fleet manager or a vehicle owner, we make US sourcing as simple as a local purchase.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/register/fleet">
                            <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-primary-blue hover:bg-blue-50 font-bold transition-all w-full sm:w-auto">
                                Register Your Fleet
                            </Button>
                        </Link>
                        <Link href="/quote">
                            <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary-orange hover:bg-orange-600 text-white font-bold transition-all w-full sm:w-auto">
                                Start Your First Order
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
                </div>
            </section>
        </div>
    )
}
