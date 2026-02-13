"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserCheck, MapPin, ShieldCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AgentRegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        location: "",
        experience: ""
    })

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'agent',
                        location: formData.location,
                        experience: formData.experience
                    }
                }
            })

            if (error) throw error

            if (data?.user) {
                toast.success("Registration successful!", {
                    description: "Your application is now being reviewed by our admin team."
                })
                router.push('/portal/agent') // Will show PendingApproval component
            }
        } catch (error: any) {
            console.error("Signup error:", error)
            toast.error("Registration failed", {
                description: error.message
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-12 shadow-premium border border-slate-100">
                    <form onSubmit={handleSignup} className="flex flex-col gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary-orange/5 flex items-center justify-center text-primary-orange">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <h1 className="text-4xl font-semibold text-primary-blue tracking-tight">Become an Agent</h1>
                            <p className="text-slate-500 font-medium">Join our regional distribution network and represent Hobort in your area.</p>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                <Input
                                    required
                                    placeholder="John Doe"
                                    className="rounded-xl h-12 font-medium"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                    <Input
                                        required
                                        type="email"
                                        placeholder="john@example.com"
                                        className="rounded-xl h-12 font-medium"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <Input
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl h-12 font-medium"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-700">Primary Location / Region</label>
                                <Input
                                    required
                                    placeholder="e.g. Kumasi, Ashanti Region"
                                    className="rounded-xl h-12 font-medium"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-700">Experience in Logistics (Years)</label>
                                <Input
                                    required
                                    type="number"
                                    placeholder="2"
                                    className="rounded-xl h-12 font-medium"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            disabled={isLoading}
                            variant="orange"
                            className="w-full h-16 rounded-2xl text-lg font-semibold"
                        >
                            {isLoading ? "Processing..." : "Join Network"}
                        </Button>

                        <Link href="/services" className="text-center text-slate-400 hover:text-primary-blue transition-colors text-sm font-medium">
                            &larr; Back to services
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    )
}
