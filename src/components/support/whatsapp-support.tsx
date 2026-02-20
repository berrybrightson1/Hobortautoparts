"use client"

import * as React from "react"
import { MessageCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WhatsAppSupportProps {
    isOpen: boolean
    onClose: () => void
    phoneNumber?: string // e.g. "233xxxxxxxxx"
    message?: string
}

export function WhatsAppSupport({
    isOpen,
    onClose,
    phoneNumber = "233555555555", // Replace with actual support number
    message = "Hello, I'm having trouble placing an order. Can you assist me?"
}: WhatsAppSupportProps) {

    const handleRedirect = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                    />
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl z-[9999] p-6 border border-slate-100"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
                            aria-label="Close support modal"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-2">
                                <MessageCircle className="h-8 w-8" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Need Help Ordering?</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    It seems you might be facing some issues. Chat with our support team on WhatsApp for instant assistance.
                                </p>
                            </div>

                            <button
                                onClick={handleRedirect}
                                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-200"
                            >
                                <MessageCircle className="h-5 w-5 fill-current" />
                                Chat on WhatsApp
                            </button>

                            <button
                                onClick={onClose}
                                className="text-xs text-slate-400 font-bold uppercase tracking-wider hover:text-slate-600"
                            >
                                Maybe later
                            </button>
                        </div>
                    </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    )
}
