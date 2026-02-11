"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePortalStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Briefcase, Truck, ArrowRight, Loader2 } from "lucide-react"

export default function SignupPage() {
    const router = useRouter()
    const { setRole } = usePortalStore()
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("customer")

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)

            // Set the global role state for the demo
            if (activeTab === 'customer') setRole('customer')
            else if (activeTab === 'agent') setRole('agent')
            // else if (activeTab === 'fleet') setRole('fleet') // Assuming fleet maps to something or customer for now

            // Redirect
            if (activeTab === 'agent') {
                router.push("/portal/agent")
            } else {
                router.push("/portal/customer")
            }
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-primary-blue tracking-tight">Create Account</h1>
                <p className="text-primary-blue/60 font-medium">Join our global network of auto parts professionals.</p>
            </div>

            <Tabs defaultValue="customer" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-primary-blue/5 p-1 rounded-2xl">
                    <TabsTrigger value="customer" className="rounded-xl font-semibold h-10 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm">
                        Customer
                    </TabsTrigger>
                    <TabsTrigger value="agent" className="rounded-xl font-semibold h-10 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm">
                        Partner
                    </TabsTrigger>
                </TabsList>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first-name" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">First Name</Label>
                            <Input id="first-name" placeholder="John" className="h-11 rounded-xl bg-primary-blue/5 border-primary-blue/10 font-medium" required disabled={isLoading} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="last-name" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Last Name</Label>
                            <Input id="last-name" placeholder="Doe" className="h-11 rounded-xl bg-primary-blue/5 border-primary-blue/10 font-medium" required disabled={isLoading} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Email Address</Label>
                        <Input id="email" type="email" placeholder="name@company.com" className="h-11 rounded-xl bg-primary-blue/5 border-primary-blue/10 font-medium" required disabled={isLoading} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Password</Label>
                        <Input id="password" type="password" className="h-11 rounded-xl bg-primary-blue/5 border-primary-blue/10 font-medium" required disabled={isLoading} />
                    </div>

                    {activeTab === 'agent' && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label htmlFor="company" className="ml-1 text-primary-blue/80 font-semibold text-xs uppercase tracking-wider">Company Name</Label>
                            <Input id="company" placeholder="Auto Pros Ltd" className="h-11 rounded-xl bg-primary-blue/5 border-primary-blue/10 font-medium" required disabled={isLoading} />
                        </div>
                    )}

                    <Button className="w-full mt-2 h-12 rounded-xl font-semibold text-base shadow-xl shadow-primary-blue/10 bg-primary-blue hover:bg-hobort-blue-dark transition-all hover:scale-[1.01] active:scale-[0.99] text-white" disabled={isLoading}>
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                        )}
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
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
