"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Loader2 } from "lucide-react"

export default function PortalRouter() {
    const router = useRouter()
    const { profile, loading } = useAuth()

    useEffect(() => {
        if (loading) return

        if (!profile?.role) {
            router.push("/login")
            return
        }

        const role = profile.role
        switch (role) {
            case "admin":
                router.push("/portal/admin")
                break
            case "agent":
                router.push("/portal/agent")
                break
            case "customer":
                router.push("/portal/customer")
                break
            default:
                router.push("/login")
        }
    }, [profile, loading, router])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
            <p className="text-sm font-semibold text-primary-blue/60 uppercase tracking-widest">
                Redirecting to your workspace...
            </p>
        </div>
    )
}
