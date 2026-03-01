"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { usePortalStore } from "@/lib/store"
import { useAuth } from "@/components/auth/auth-provider"
import { logAction } from "@/lib/audit"
import { cn } from "@/lib/utils"

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary-blue/20" /></div>}>
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnTo = searchParams.get("returnTo")
    const { setRole } = usePortalStore()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [authError, setAuthError] = useState<string | null>(null)
    const { profile, loading } = useAuth()

    // Auto-redirect once AuthProvider fetches the role
    useEffect(() => {
        if (loading) return // Still fetching
        if (!profile) return // Not logged in yet

        if (profile?.role) {
            const userRole = profile.role

            if (userRole !== 'admin') {
                supabase.auth.signOut().then(() => {
                    toast.error("Unauthorized Access", {
                        description: "This portal is strictly for administrators."
                    })
                })
                return
            }

            setRole(userRole)

            // Honor returnTo if present, otherwise directly to admin portal
            if (returnTo) {
                router.push(returnTo)
            } else {
                router.push("/portal/admin")
            }
        }
    }, [profile, loading, router, setRole, returnTo])


    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        setAuthError(null)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            const signedInUser = data.user
            if (!signedInUser) throw new Error("No user returned from sign in")

            // Strict role isolation: must be admin
            const metaRole = signedInUser.user_metadata?.role || 'customer'

            // Fetch profile directly to get authoritative role without waiting for AuthProvider
            const { data: profileData } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', signedInUser.id)
                .single()

            const role = profileData?.role || metaRole

            if (role !== 'admin') {
                await supabase.auth.signOut()
                throw new Error(`Unauthorized Access. Only administrators can log in here.`)
            }

            setRole(role)

            await logAction('login', { email: email.toLowerCase(), method: 'password' })

            toast.success("Identity verified", {
                description: "Redirecting to admin portal..."
            })

            // Redirect immediately
            if (returnTo) {
                router.push(returnTo)
            } else {
                router.push("/portal/admin")
            }

        } catch (error: any) {
            if (error.name === 'AbortError') return

            setAuthError("Sign in failed")
            toast.error("Sign in failed", {
                description: error.message || "Please check your credentials and try again."
            })
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-semibold text-primary-blue tracking-tight">Admin Sign In</h1>
                <p className="text-primary-blue/60 font-medium">Enter your credentials to access the admin portal.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="email" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Email Address</Label>
                    <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                            setAuthError(null)
                        }}
                        required
                        className="h-12 rounded-xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-medium"
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" university-link="true" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Password</Label>
                    </div>
                    <PasswordInput
                        id="password"
                        disabled={isLoading}
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setPassword(e.target.value)
                            setAuthError(null)
                        }}
                        required
                    />
                </div>
                <Button
                    type="submit"
                    className={cn(
                        "w-full h-12 rounded-xl font-semibold text-base shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-white mt-4",
                        authError
                            ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                            : "shadow-primary-blue/10 bg-primary-blue hover:bg-hobort-blue-dark"
                    )}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Signing in...</span>
                        </div>
                    ) : authError ? (
                        <span className="flex items-center gap-2">
                            {authError}
                        </span>
                    ) : (
                        "Sign In"
                    )}
                </Button>
            </form>
        </div>
    )
}
