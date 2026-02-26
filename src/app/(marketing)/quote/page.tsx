"use client"

import { useState } from "react"

import { RequestForm } from "@/components/marketing/request-form"
import { WhatsAppOrderModal } from "@/components/marketing/whatsapp-order-modal"
import { Zap, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function QuotePage() {
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [waOpen, setWaOpen] = useState(false)

    return (
        <div className="relative min-h-screen bg-slate-50">
            {/* Ambient Background Patterns */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary-blue/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-primary-orange/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            <main className="relative z-10 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
                    {/* Hero Section - Hidden on success */}
                    {!isSubmitted && (
                        <div className="mb-12 md:mb-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                            <div className="space-y-4 text-left">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-blue text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary-blue/20"
                                >
                                    <Zap className="h-3 w-3 fill-primary-orange text-primary-orange" />
                                    Global Sourcing Network
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-4xl md:text-6xl font-semibold text-primary-blue tracking-tighter leading-[1.1]"
                                >
                                    New Sourcing <span className="text-primary-orange italic">Request</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-base md:text-xl text-primary-blue/60 font-medium max-w-2xl"
                                >
                                    Get a premium price estimate from our global network in record time.
                                </motion.p>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="shrink-0"
                            >
                                <Button
                                    onClick={() => setWaOpen(true)}
                                    className="h-16 px-8 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow-xl shadow-[#25D366]/20 transition-all flex items-center gap-3 active:scale-95 group"
                                >
                                    <MessageCircle className="h-6 w-6 fill-white group-hover:rotate-12 transition-transform" />
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-widest leading-none opacity-80 mb-1">Instant Help</p>
                                        <p className="text-base uppercase tracking-wider">Order Via WhatsApp</p>
                                    </div>
                                </Button>
                            </motion.div>
                        </div>
                    )}

                    {/* Main Form Component */}
                    <div className="max-w-7xl mx-auto">
                        <RequestForm onSuccess={() => setIsSubmitted(true)} />
                    </div>

                </div>
            </main>

            {/* WhatsApp Modal */}
            <WhatsAppOrderModal open={waOpen} onOpenChange={setWaOpen} />
        </div>
    )
}
