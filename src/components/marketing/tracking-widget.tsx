"use client"

import React from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function TrackingWidget({ className }: { className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className={cn("w-full max-w-2xl relative px-4", className)}
        >
            <div className="glass p-2 rounded-[2rem] shadow-premium group/tracker transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(27,78,111,0.15)] border-2 border-slate-200/60 ring-1 ring-slate-100/50 bg-white/20 backdrop-blur-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-[1.25rem] md:rounded-[1.75rem] p-2 md:p-3 flex flex-row gap-2 items-center border border-white relative overflow-hidden">
                    <div className="flex-1 w-full relative">
                        <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/tracker:text-primary-orange transition-colors">
                            <Search className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Enter Order ID"
                            className="w-full h-12 md:h-16 rounded-xl md:rounded-2xl border-2 border-slate-50 bg-slate-50/30 pl-10 md:pl-16 pr-2 md:pr-6 text-sm md:text-lg font-medium focus:bg-white focus:ring-4 md:focus:ring-8 focus:ring-primary-orange/5 focus:border-primary-orange transition-all outline-none placeholder:text-slate-400"
                            onChange={(e) => window.localStorage.setItem('temp_track_id', e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = (e.currentTarget as HTMLInputElement).value
                                    if (val) window.location.href = `/track/${val}`
                                }
                            }}
                        />
                    </div>
                    <Button
                        variant="orange"
                        className="h-12 md:h-16 px-4 md:px-12 rounded-xl md:rounded-2xl w-auto font-semibold text-sm md:text-lg shadow-xl shadow-primary-orange/20 hover:shadow-primary-orange/40 hover:-translate-y-0.5 transition-all group-hover/tracker:scale-[1.02] text-white whitespace-nowrap"
                        onClick={() => {
                            const val = window.localStorage.getItem('temp_track_id')
                            if (val) window.location.href = `/track/${val}`
                        }}
                    >
                        <span className="hidden sm:inline">Locate Shipment</span>
                        <span className="sm:hidden">Track</span>
                    </Button>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4 md:gap-10">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-blue/30" />
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Georgia Export Hub</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-blue/30" />
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">US Logistics Center</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400/30" />
                    <p className="text-[10px] font-medium uppercase tracking-widest text-green-600/60">Accra Pickup</p>
                </div>
            </div>
        </motion.div>
    )
}
