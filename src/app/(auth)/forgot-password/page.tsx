"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, Loader2, CheckCircle2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setIsSent(true)
            toast.success("Reset link sent!")
        } catch (error: any) {
            toast.error("Error", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary-blue/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary-orange/5 rounded-full blur-[100px]" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-bold uppercase tracking-widest mb-8 transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Login
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white py-10 px-8 rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100"
                >
                    {!isSent ? (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="h-14 w-14 rounded-2xl bg-primary-blue/10 flex items-center justify-center text-primary-blue mb-6">
                                    <Shield className="h-7 w-7" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Forgot password?</h1>
                                <p className="text-slate-500 font-medium">No worries, we'll send you reset instructions.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            required
                                            className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full h-14 rounded-2xl bg-primary-blue hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-95"
                                >
                                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Send Reset Link"}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-8 text-center pb-4">
                            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Email Sent!</h1>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    We've sent a password reset link to <span className="text-slate-900 font-bold">{email}</span>.
                                </p>
                            </div>
                            <p className="text-xs text-slate-400 font-medium pt-4">
                                Didn't receive the email? Check your spam folder or <button onClick={() => setIsSent(false)} className="text-primary-blue font-bold hover:underline">try again</button>.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>

            <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                Hobort Identity Services
            </p>
        </div>
    )
}
