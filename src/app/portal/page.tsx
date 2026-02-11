"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePortalStore } from "@/lib/store"
import { Loader2 } from "lucide-react"

export default function PortalRouter() {
    const router = useRouter()
    const { role } = usePortalStore()

    useEffect(() => {
        if (!role) {
            router.push("/login")
            return
        }

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
    }, [role, router])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
            <p className="text-sm font-semibold text-primary-blue/60 uppercase tracking-widest">
                Redirecting to your workspace...
            </p>
        </div>
    )
}
