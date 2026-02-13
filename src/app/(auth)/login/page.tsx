"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export default function LoginPage() {
    const router = useRouter()
    const { setRole } = usePortalStore()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [activeRole, setActiveRole] = useState("customer")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { profile, loading } = useAuth()

    // Auto-redirect once AuthProvider fetches the role
    useEffect(() => {
        if (loading) return // Still fetching

        if (profile?.role) {
            const userRole = profile.role

            // Redirect to the dashboard corresponding to the user's role
            setRole(userRole)

            if (userRole === 'admin') router.push("/portal/admin")
            else if (userRole === 'agent') router.push("/portal/agent")
            else router.push("/portal/customer")
        }
    }, [profile, loading, router, setRole, activeRole])

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Wait a brief moment for the AuthProvider to catch the session change
            // This prevents the 'AbortError' collision by letting the provider lead
            toast.success("Identity verified", {
                description: "Synchronizing your portal access..."
            })

        } catch (error: any) {
            // Silently handle abort errors (common during rapid navigation or provider takeover)
            if (error.name === 'AbortError') {
                return;
            }

            console.error("Sign-in process failed:", error);
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
                            onChange={(e) => setEmail(e.target.value)}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base shadow-xl shadow-primary-blue/10 bg-primary-blue hover:bg-hobort-blue-dark transition-all hover:scale-[1.01] active:scale-[0.99] text-white" disabled={isLoading}>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Signing in...</span>
                            </div>
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
                    <span className="bg-white px-3 text-primary-blue/30 font-bold tracking-widest leading-none">Security Guaranteed</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs" disabled={isLoading}>
                    Google
                </Button>
                <Button variant="outline" className="h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs" disabled={isLoading}>
                    Apple
                </Button>
            </div>

            <p className="text-sm text-center text-primary-blue/60 font-medium pt-4">
                New to Hobort?{" "}
                <Link href="/signup" className="font-semibold text-primary-orange hover:text-orange-600 transition-colors">
                    Join now
                </Link>
            </p>
        </div>
    )
}
