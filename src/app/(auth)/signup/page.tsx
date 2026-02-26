"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { usePortalStore } from "@/lib/store"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Loader2, Mail, RefreshCw, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { sendWelcomeEmailAction } from "@/app/actions/email-actions"
import { isDisposableEmail } from "@/lib/email-validation"
import { Suspense } from "react"

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary-blue/20" /></div>}>
            <SignupContent />
        </Suspense>
    )
}

function SignupContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnTo = searchParams.get("returnTo")
    const { setRole } = usePortalStore()
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("customer")
    const { profile, loading } = useAuth()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [company, setCompany] = useState("")

    const handleGoogleSignUp = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/portal/${activeTab}`,
                },
            })
            if (error) throw error
        } catch (error: any) {
            toast.error("Google Sign Up Failed", {
                description: error.message || "Could not connect to Google.",
            })
            setIsLoading(false)
        }
    }

    // Auto-redirect once AuthProvider fetches the role/profile
    useEffect(() => {
        if (loading) return
        if (!profile) return // Not logged in yet

        if (profile?.role) {
            const userRole = profile.role as 'customer' | 'agent' | 'admin'
            setRole(userRole)
            if (returnTo) {
                router.push(returnTo)
            } else {
                if (userRole === 'admin') router.push("/portal/admin")
                else if (userRole === 'agent') router.push("/portal/agent")
                else router.push("/portal/customer")
            }
        }
    }, [profile, loading, router, setRole, returnTo])

    // STEP 1: Submit the sign-up form
    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()

        // Form Validation: Block disposable emails before even hitting the database
        if (isDisposableEmail(email)) {
            toast.error("Invalid Email Address", {
                description: "Please use a valid, permanent email address. Temporary or disposable emails are not allowed.",
            })
            return
        }

        setIsLoading(true)

        try {
            const fullName = `${firstName} ${lastName}`.trim()
            const userRole = activeTab as 'customer' | 'agent'

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: userRole,
                        phone_number: phoneNumber,
                        company_name: activeTab === 'agent' ? company : null
                    }
                }
            })

            if (error) {
                if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('already exists')) {
                    toast.warning("Account already exists", {
                        description: "This email is already registered. Please sign in instead."
                    })
                    return
                }
                throw error
            }

            // Instantly send the welcome email for customers since OTP is bypassed
            if (userRole === 'customer') {
                try {
                    await sendWelcomeEmailAction(email, firstName)
                } catch (e) {
                    console.warn("Welcome email failed (non-blocking):", e)
                }

                toast.success("Account created! Welcome aboard 🎉", {
                    description: "Check your email for a welcome message from us. Redirecting..."
                })
            } else {
                toast.success("Application submitted!", {
                    description: "Your agent application is pending admin approval. You'll receive an email once approved."
                })
            }

            // The useEffect will handle the redirect once profile syncs, but proactive setRole helps UI switch faster
            setRole(userRole)

        } catch (error: any) {
            toast.error("Signup failed", {
                description: error.message || "An error occurred. Please try again."
            })
        } finally {
            setIsLoading(false)
        }
    }

    // ── SIGN-UP FORM SCREEN ────────────────────────────────────────
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-primary-blue tracking-tight">
                    Create Account
                </h1>
                <p className="text-primary-blue/60 font-medium">
                    Join our global network of auto parts professionals.
                </p>
            </div>

            <Tabs defaultValue="customer" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-primary-blue/5 p-1 rounded-2xl">
                    <TabsTrigger value="customer" className="rounded-xl font-semibold h-10 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm">
                        Customer
                    </TabsTrigger>
                    <TabsTrigger value="agent" className="rounded-xl font-semibold h-10 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm">
                        Partner / Agent
                    </TabsTrigger>
                </TabsList>

                {/* Description based on selected tab */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-sm text-primary-blue/80 leading-relaxed">
                        {activeTab === "customer" ? (
                            <>
                                <strong>Customer Account:</strong> Order auto parts, track shipments, and manage your requests. Perfect for individuals and businesses sourcing parts from the US.
                            </>
                        ) : (
                            <>
                                <strong>Partner / Agent Account:</strong> Join our affiliate network and earn commissions by referring customers. Your application will be reviewed by our admin team within 24-48 hours. Once approved, you'll gain access to partner tools and start earning.
                            </>
                        )}
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first-name" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">First Name</Label>
                            <Input
                                id="first-name"
                                placeholder="John"
                                className="h-11 rounded-xl bg-primary-blue/5 border-primary-blue/10 font-medium"
                                required
                                disabled={isLoading}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="last-name" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Last Name</Label>
                            <Input
                                id="last-name"
                                placeholder="Doe"
                                className="h-11 rounded-xl bg-primary-blue/5 border-primary-blue/10 font-medium"
                                required
                                disabled={isLoading}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            className="h-11 rounded-xl bg-primary-blue/5 border-primary-blue/10 font-medium"
                            required
                            disabled={isLoading}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            className="h-11 rounded-xl bg-primary-blue/5 border-primary-blue/10 font-medium"
                            required
                            disabled={isLoading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Password</Label>
                        <PasswordInput
                            id="password"
                            required
                            disabled={isLoading}
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            showStrength={true}
                        />
                    </div>

                    {activeTab === 'agent' && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label htmlFor="company" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Company Name (Optional)</Label>
                            <Input
                                id="company"
                                placeholder="Auto Pros Ltd"
                                className="h-11 rounded-xl bg-primary-blue/5 border-primary-blue/10 font-medium"
                                disabled={isLoading}
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </div>
                    )}

                    <Button type="submit" className="w-full mt-2 h-12 rounded-xl font-semibold text-base shadow-xl shadow-primary-blue/10 bg-primary-blue hover:bg-hobort-blue-dark transition-all hover:scale-[1.01] active:scale-[0.99] text-white" disabled={isLoading}>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                                <span>Creating account...</span>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'agent' ? 'Apply Now' : 'Get Started'} <ArrowRight className="ml-2 h-4 w-4" />
                            </>
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
                onClick={handleGoogleSignUp}
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
                Sign up with Google
            </Button>

            <p className="text-sm text-center text-primary-blue/60 font-medium pt-4">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary-orange hover:text-orange-600 transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
