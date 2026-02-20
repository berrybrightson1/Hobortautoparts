"use client"

import React from "react"
import { motion } from "framer-motion"
import { MessageSquare as WhatsAppIcon } from "lucide-react"

export function FloatingWhatsAppButton() {
    const phoneNumber = "233555555555" // Actual support number should be configured here
    const message = "Hello! I'm interested in sourcing some auto parts. Can you help me?"

    const handleWhatsAppClick = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWhatsAppClick}
            className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[100] h-14 w-14 md:h-16 md:w-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:bg-[#128C7E] group"
            aria-label="Contact support on WhatsApp"
        >
            <WhatsAppIcon className="h-7 w-7 md:h-8 md:w-8 fill-white/10" />

            {/* Tooltip */}
            <div className="absolute right-full mr-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
                Instant Assistance
            </div>

            {/* Ping animation effect */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
        </motion.button>
    )
}
