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
import { ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { sendWelcomeEmailAction } from "@/app/actions/email-actions"
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
    const { profile, loading } = useAuth() // Access global auth state
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [company, setCompany] = useState("")

    // Auto-redirect once AuthProvider fetches the role/profile
    useEffect(() => {
        if (loading) return

        if (profile?.role) {
            const userRole = profile.role

            // Sync store
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

        try {
            const fullName = `${firstName} ${lastName}`.trim()

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: activeTab === 'agent' ? 'agent' : 'customer',
                        phone_number: phoneNumber,
                        company_name: activeTab === 'agent' ? company : null
                    }
                }
            })

            if (error) throw error

            if (data?.user?.identities?.length === 0) {
                toast.warning("Email already exists", {
                    description: "Please try signing in instead."
                })
                return
            }

            if (activeTab === 'agent') {
                toast.success("Application submitted!", {
                    description: "Your agent application is pending admin approval. You'll receive an email once approved."
                })
            } else {
                toast.success("Account created successfully!", {
                    description: "Welcome to Hobort Auto Parts Express!"
                })
                // Send Welcome Email
                try {
                    await sendWelcomeEmailAction(email, firstName)
                } catch (e) {
                    console.warn("Welcome email failed (non-blocking):", e)
                }
            }

            setRole(activeTab === 'agent' ? 'agent' : 'customer')

            // Redirect handled by useEffect once profile syncs

        } catch (error: any) {
            toast.error("Signup failed", {
                description: error.message || "An error occurred. Please try again."
            })
        } finally {
            setIsLoading(false)
        }
    }

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
                                <span>{activeTab === 'agent' ? 'Submitting Application...' : 'Creating Account...'}</span>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'agent' ? 'Apply Now' : 'Get Started'} <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>
            </Tabs>

            <p className="text-sm text-center text-primary-blue/60 font-medium pt-4">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary-orange hover:text-orange-600 transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
