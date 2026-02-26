"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { usePortalStore } from "@/lib/store"
import { useAuth } from "@/components/auth/auth-provider"
import { Suspense } from "react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
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
    const [showPassword, setShowPassword] = useState(false)
    const [activeRole, setActiveRole] = useState("customer")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [authError, setAuthError] = useState<string | null>(null)
    const { profile, loading } = useAuth()

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        setAuthError(null)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/login`,
                },
            })
            if (error) throw error
        } catch (error: any) {
            toast.error("Google Sign In Failed", {
                description: error.message || "Could not connect to Google.",
            })
            setIsLoading(false)
        }
    }

    // Auto-redirect once AuthProvider fetches the role
    useEffect(() => {
        if (loading) return // Still fetching
        if (!profile) return // Not logged in yet

        if (profile?.role) {
            const userRole = profile.role

            // Redirect to the dashboard corresponding to the user's role
            setRole(userRole)

            // Honor returnTo if present, otherwise role-based redirect
            if (returnTo) {
                router.push(returnTo)
            } else {
                if (userRole === 'admin') router.push("/portal/admin")
                else if (userRole === 'agent') router.push("/portal/agent")
                else router.push("/portal/customer")
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

            // Proactive sync for faster redirection
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const role = user.user_metadata?.role || 'customer'

                // Strict role isolation: User must log in from the correct tab
                if (role !== activeRole) {
                    await supabase.auth.signOut()
                    throw new Error(`Access denied. Please select the '${role}' tab to sign in.`)
                }

                setRole(role)

                toast.success("Identity verified", {
                    description: "Redirecting to your portal..."
                })

                // router.push is handled by useEffect when profile updates
            }

        } catch (error: any) {
            // Silently handle abort errors (common during rapid navigation or provider takeover)
            if (error.name === 'AbortError') {
                return;
            }

            setAuthError("Sign in failed")
            toast.error("Sign in failed", {
                description: error.message || "Please check your credentials and try again."
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-primary-blue tracking-tight">Sign In</h1>
                <p className="text-primary-blue/60 font-medium">Select your portal to continue.</p>
            </div>

            <Tabs defaultValue="customer" className="w-full" onValueChange={setActiveRole}>
                <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-primary-blue/5 p-1 rounded-2xl">
                    <TabsTrigger value="customer" className="rounded-xl font-semibold h-10 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm text-[10px] uppercase tracking-wider">
                        Customer
                    </TabsTrigger>
                    <TabsTrigger value="agent" className="rounded-xl font-semibold h-10 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm text-[10px] uppercase tracking-wider">
                        Agent
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="rounded-xl font-semibold h-10 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm text-[10px] uppercase tracking-wider">
                        Admin
                    </TabsTrigger>
                </TabsList>

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
                            <Link href="/forgot-password" university-link="true" className="text-xs font-semibold text-primary-orange hover:text-orange-600 transition-colors">
                                Forgot?
                            </Link>
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
                            "w-full h-12 rounded-xl font-semibold text-base shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-white",
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
                            "Continue"
                        )}
                    </Button>
                </form>
            </Tabs>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary-blue/5" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-3 text-primary-blue/30 font-bold tracking-widest leading-none">Or continue with</span>
                </div>
            </div>

            <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                disabled={isLoading}
                type="button"
            >
                <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
            </Button>

            <p className="text-sm text-center text-primary-blue/60 font-medium pt-4">
                New to Hobort?{" "}
                <Link href="/signup" className="font-semibold text-primary-orange hover:text-orange-600 transition-colors">
                    Join now
                </Link>
            </p>
        </div>
    )
}
