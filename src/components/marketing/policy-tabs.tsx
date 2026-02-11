"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const POLICY_LINKS = [
    { name: "Shipping", href: "/shipping-policy" },
    { name: "Returns", href: "/return-policy" },
    { name: "Privacy", href: "/privacy-policy" },
    { name: "Sitemap", href: "/sitemap" },
]

export function PolicyTabs() {
    const pathname = usePathname()

    return (
        <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit mb-12">
            {POLICY_LINKS.map((link) => {
                const isActive = pathname === link.href
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-300",
                            isActive
                                ? "bg-white text-primary-orange shadow-sm shadow-orange-500/5 ring-1 ring-black/5"
                                : "text-primary-blue/40 hover:text-primary-blue hover:bg-white/50"
                        )}
                    >
                        {link.name}
                    </Link>
                )
            })}
        </div>
    )
}
