"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight, Mail } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [email, setEmail] = useState("")

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setIsSubmitted(true)
            toast.success("Reset link sent!", {
                description: "Please check your email for the recovery link."
            })
        } catch (error: any) {
            toast.error("Request failed", {
                description: error.message || "An error occurred. Please try again."
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <Mail className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-semibold text-primary-blue tracking-tight">Check your email</h1>
                    <p className="text-primary-blue/60 font-medium leading-relaxed">
                        We've sent a password recovery link to <span className="text-primary-blue font-bold">{email}</span>.
                        The link will expire in 24 hours.
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/login" className="w-full">
                        <Button variant="outline" className="w-full h-12 rounded-xl border-primary-blue/10 bg-primary-blue/5 hover:bg-primary-blue/10 text-primary-blue font-semibold transition-all">
                            Back to Sign In
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-center text-slate-400 font-medium mt-6">
                    Didn't receive the email? Check your spam folder or <button onClick={() => setIsSubmitted(false)} className="text-primary-orange font-bold hover:underline">try again</button>.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-primary-blue tracking-tight">Forgot Password</h1>
                <p className="text-primary-blue/60 font-medium leading-relaxed">Enter your email and we'll send you a link to reset your password.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="email" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Email Address</Label>
                    <Input
                        id="email"
                        placeholder="name@company.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-medium"
                    />
                </div>

                <Button type="submit" className="w-full mt-2 h-12 rounded-xl font-semibold text-base shadow-xl shadow-primary-blue/10 bg-primary-blue hover:bg-hobort-blue-dark transition-all hover:scale-[1.01] active:scale-[0.99] text-white" disabled={isLoading}>
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sending Link...</span>
                        </div>
                    ) : (
                        <>
                            Send Reset Link <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <p className="text-sm text-center text-primary-blue/60 font-medium pt-4">
                Remember your password?{" "}
                <Link href="/login" className="font-semibold text-primary-orange hover:text-orange-600 transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
