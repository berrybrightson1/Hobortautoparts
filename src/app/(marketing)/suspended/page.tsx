"use client"

import React from "react"
import Link from "next/link"
import { AlertTriangle, Home, Mail, ShieldAlert, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function SuspendedPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
            >
                {/* Header Decoration */}
                <div className="h-4 w-full bg-red-500" />

                <div className="p-10 md:p-16 text-center space-y-8">
                    <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-red-50 flex items-center justify-center text-red-600 shadow-inner group">
                        <ShieldAlert className="h-12 w-12 group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Account Suspended</h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Access to the Hobort Portal has been temporarily revoked for this account.
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-3xl p-6 text-left border border-slate-100 space-y-4">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-slate-600">
                                This action is usually taken due to policy violations, failed verification, or administrative review.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Governance</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="mailto:support@hobortautoexpress.com" className="flex-1">
                                <Button variant="outline" className="w-full h-14 rounded-2xl gap-3 font-bold text-slate-600 hover:bg-slate-50 border-slate-200">
                                    <Mail className="h-5 w-5" /> Email Audit
                                </Button>
                            </Link>
                            <Button variant="outline" className="flex-1 h-14 rounded-2xl gap-3 font-bold text-slate-600 hover:bg-slate-50 border-slate-200">
                                <PhoneCall className="h-5 w-5" /> Phone Support
                            </Button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <Link href="/">
                            <Button variant="ghost" className="rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 gap-2 uppercase text-[10px] tracking-widest">
                                <Home className="h-4 w-4" /> Back to Homepage
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-slate-900 p-4 text-center">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Hobort Security & Compliance</p>
                </div>
            </motion.div>
        </div>
    )
}
