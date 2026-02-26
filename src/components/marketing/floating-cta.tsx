"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FloatingCTA() {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="fixed bottom-6 left-6 right-20 z-50 md:hidden"
            >
                <div className="h-16 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-2xl flex items-center justify-between pl-6 pr-2">
                    <span className="text-sm font-semibold text-slate-800">Ready to order?</span>
                    <Link href="/signup">
                        <Button variant="orange" className="h-12 px-6 rounded-full text-white font-semibold text-sm shadow-lg hover:scale-105 transition-transform" >
                            Start Sourcing
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
