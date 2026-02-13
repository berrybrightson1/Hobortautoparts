"use client"

import React from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function TrackingWidget({ className }: { className?: string }) {
    const router = useRouter()
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className={cn("w-full max-w-2xl relative", className)}
        >
            <div className="relative group hover:border-white/20 transition-colors duration-500">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-transparent blur opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-2 md:p-3 shadow-2xl relative">
                    <div className="flex flex-row gap-2 relative z-10">
                        <div className="relative flex-1 group/input">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary-orange transition-colors">
                                <Search className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Trace Shipment ID"
                                className="w-full h-12 md:h-14 bg-black/20 border border-white/5 rounded-2xl pl-10 md:pl-12 pr-4 text-white placeholder-slate-400 text-base md:text-base focus:outline-none focus:bg-black/40 focus:ring-1 focus:ring-primary-orange/50 transition-all font-medium"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = (e.currentTarget as HTMLInputElement).value
                                        if (val) router.push(`/track/${val}`)
                                    }
                                }}
                            />
                        </div>
                        <Button
                            variant="orange"
                            className="h-12 md:h-14 px-5 md:px-8 bg-white text-primary-blue font-bold rounded-2xl md:rounded-2xl text-sm md:text-base hover:bg-slate-200 transition-colors shadow-lg whitespace-nowrap flex items-center gap-2"
                            onClick={(e) => {
                                const input = e.currentTarget.parentElement?.querySelector('input')
                                if (input?.value) router.push(`/track/${input.value}`)
                            }}
                        >
                            <span className="hidden sm:inline">Track Now</span>
                            <span className="sm:hidden">Track</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-start gap-4 md:gap-8 opacity-80">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-orange shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Georgia Hub</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">US Logistics</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Accra Pickup</p>
                </div>
            </div>
        </motion.div>
    )
}
