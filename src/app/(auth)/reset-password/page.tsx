"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Password strength calculation
    const strength = React.useMemo(() => {
        let score = 0
        if (password.length > 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++
        return score
    }, [password])

    const strengthText = ["Weak", "Fair", "Good", "Strong"][strength - 1] || ""
    const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"][strength - 1] || "bg-slate-200"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password })

            if (error) throw error

            setIsSuccess(true)
            toast.success("Security Restored", { description: "Your password has been updated." })

            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (error: any) {
            toast.error("Update failed", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl text-center space-y-8"
                >
                    <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Access Restored</h1>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Your password has been successfully updated. Redirecting to login...
                        </p>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3 }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary-blue/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary-orange/5 rounded-full blur-[100px]" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white py-10 px-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100"
                >
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <div className="h-14 w-14 rounded-2xl bg-primary-orange/10 flex items-center justify-center text-primary-orange mb-6">
                                <Lock className="h-7 w-7" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create new password</h1>
                            <p className="text-slate-500 font-medium">Please enter something strong and unique.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="h-14 pr-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    {/* Strength Meter */}
                                    <div className="px-1 space-y-2 pt-1">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-400">Security Strength</span>
                                            <span className={cn(
                                                strength === 1 ? "text-red-500" :
                                                    strength === 2 ? "text-orange-500" :
                                                        strength === 3 ? "text-yellow-600" :
                                                            "text-emerald-600"
                                            )}>{strengthText}</span>
                                        </div>
                                        <div className="flex gap-1 h-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "flex-1 rounded-full transition-all duration-500",
                                                        i <= strength ? strengthColor : "bg-slate-100"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</Label>
                                    <Input
                                        type="password"
                                        required
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || strength < 3}
                                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-95"
                            >
                                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Secure Account"}
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>

            <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                Hobort Identity Services
            </p>
        </div>
    )
}
