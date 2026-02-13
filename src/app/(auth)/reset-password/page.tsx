"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // Supabase handles the session from the URL automatically if it's a recovery link
    // but we can verify we have a session if needed.

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match", {
                description: "Please ensure both password fields are identical."
            })
            return
        }

        setIsLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setIsSuccess(true)
            toast.success("Password updated!", {
                description: "Your account security has been restored."
            })

            // Auto redirect after delay
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (error: any) {
            toast.error("Update failed", {
                description: error.message || "An error occurred while updating your password."
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2 text-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Restored</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Your password has been successfully updated. <br />
                        Redirecting you to the sign in portal...
                    </p>
                </div>

                <div className="pt-8">
                    <Button
                        onClick={() => router.push("/login")}
                        className="w-full h-12 rounded-xl font-semibold bg-primary-blue hover:bg-hobort-blue-dark text-white transition-all shadow-lg"
                    >
                        Head to Login Now
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-primary-blue/5 text-primary-blue flex items-center justify-center mb-4">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-semibold text-primary-blue tracking-tight">Reset Password</h1>
                <p className="text-primary-blue/60 font-medium leading-relaxed">Choose a strong new password to protect your specialized portal access.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="password" university-link="true" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">New Password</Label>
                    <PasswordInput
                        id="password"
                        required
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        showStrength={true}
                        placeholder="••••••••"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="confirm-password" university-link="true" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Confirm New Password</Label>
                    <PasswordInput
                        id="confirm-password"
                        required
                        disabled={isLoading}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" className="w-full mt-4 h-12 rounded-xl font-semibold text-base shadow-xl shadow-primary-blue/10 bg-primary-blue hover:bg-hobort-blue-dark transition-all hover:scale-[1.01] active:scale-[0.99] text-white" disabled={isLoading}>
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Updating Security...</span>
                        </div>
                    ) : (
                        "Update Password"
                    )}
                </Button>
            </form>
        </div>
    )
}
