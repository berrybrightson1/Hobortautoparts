"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { usePortalStore } from "@/lib/store"

export default function LoginPage() {
    const router = useRouter()
    const { setRole } = usePortalStore()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [activeRole, setActiveRole] = useState("customer")

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            // Set role for demo
            setRole(activeRole as any)

            // Redirect based on role
            if (activeRole === 'admin') router.push("/portal/admin")
            else if (activeRole === 'agent') router.push("/portal/agent")
            else router.push("/portal/customer")
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-primary-blue tracking-tight">Sign In</h1>
                <p className="text-primary-blue/60 font-bold">Select your portal to continue.</p>
            </div>

            <Tabs defaultValue="customer" className="w-full" onValueChange={setActiveRole}>
                <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-primary-blue/5 p-1 rounded-2xl">
                    <TabsTrigger value="customer" className="rounded-xl font-bold h-10 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm text-[10px] uppercase tracking-wider">
                        Customer
                    </TabsTrigger>
                    <TabsTrigger value="agent" className="rounded-xl font-bold h-10 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm text-[10px] uppercase tracking-wider">
                        Agent
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="rounded-xl font-bold h-10 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm text-[10px] uppercase tracking-wider">
                        Admin
                    </TabsTrigger>
                </TabsList>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="ml-1 text-primary-blue/80 font-black text-xs uppercase tracking-wider">Email Address</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="h-12 rounded-xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-bold"
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="ml-1 text-primary-blue/80 font-black text-xs uppercase tracking-wider">Password</Label>
                            <Link href="/forgot-password" university-link="true" className="text-xs font-black text-primary-orange hover:text-orange-600 transition-colors">
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                disabled={isLoading}
                                className="h-12 rounded-xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-bold pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-blue/40 hover:text-primary-blue focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <Button className="w-full h-12 rounded-xl font-black text-base shadow-xl shadow-primary-blue/10 bg-primary-blue hover:bg-hobort-blue-dark transition-all hover:scale-[1.01] active:scale-[0.99] text-white" disabled={isLoading}>
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Continue
                    </Button>
                </form>
            </Tabs>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary-blue/5" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-3 text-primary-blue/30 font-black tracking-widest leading-none">Security Guaranteed</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-bold text-xs" disabled={isLoading}>
                    Google
                </Button>
                <Button variant="outline" className="h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-bold text-xs" disabled={isLoading}>
                    Apple
                </Button>
            </div>

            <p className="text-sm text-center text-primary-blue/60 font-bold pt-4">
                New to Hobort?{" "}
                <Link href="/signup" className="font-black text-primary-orange hover:text-orange-600 transition-colors">
                    Join now
                </Link>
            </p>
        </div>
    )
}
