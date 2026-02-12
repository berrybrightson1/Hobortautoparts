"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Search, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/lib/store"

const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
]

const AUTH_LINKS = [
    { name: "Sign In", href: "/login" },
    { name: "Register", href: "/signup" },
]

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const pathname = usePathname()
    const { role } = usePortalStore()

    // Since role is persisted and defaults to customer, we might want to check 
    // if we are on the portal or if we've explicitly set it.
    // For this demo, let's assume we show "Dashboard" if we are not on the login page 
    // and a role is present.
    const isAuthenticated = !!role

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm h-20 flex items-center">
            <div className="container max-w-[1400px] mx-auto px-6 flex items-center justify-between w-full">

                {/* Left Section: Logo, Navigation Links & CTA */}
                <div className="flex items-center gap-8 lg:gap-12">
                    <Link href="/" className="flex items-center flex-shrink-0 transition-all hover:opacity-90">
                        <img
                            src="/Hobort auto express logo Main.png"
                            alt="Hobort Auto Parts Express"
                            className="h-16 md:h-18 w-auto object-contain transition-transform hover:scale-105"
                        />
                    </Link>

                    <div className="hidden md:flex items-center gap-6 lg:gap-8">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-all relative py-2",
                                        isActive ? "text-primary-orange" : "text-primary-blue/60 hover:text-primary-blue"
                                    )}
                                >
                                    {link.name}
                                    {isActive && (
                                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-orange rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    <Link href="/quote" className="hidden lg:block">
                        <Button variant="orange" size="sm" className="rounded-full px-6 font-semibold shadow-premium h-10 text-xs text-white">
                            New Sourcing Request
                        </Button>
                    </Link>
                </div>

                {/* Right Section: Auth Links & Mobile Menu Toggle */}
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6 mr-2">
                        {isAuthenticated ? (
                            <Link href="/portal" className="text-sm font-medium text-primary-orange transition-colors flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Dashboard
                            </Link>
                        ) : (
                            AUTH_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm font-medium text-primary-blue/60 hover:text-primary-blue transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden rounded-full hover:bg-slate-50 transition-colors text-primary-blue"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu - Premium Drawer Style */}
            {
                isOpen && (
                    <div className="fixed inset-x-4 top-24 z-50 rounded-3xl border border-slate-100 bg-white/95 p-8 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-md md:hidden">
                        <div className="grid gap-8">
                            {[...NAV_LINKS, { name: "New Sourcing Request", href: "/quote" }, ...(isAuthenticated ? [{ name: "Dashboard", href: "/portal" }] : AUTH_LINKS)].map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "text-2xl font-semibold transition-all flex items-center gap-3",
                                            isActive ? "text-primary-orange" : "text-primary-blue/80 hover:text-primary-orange"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {isActive && <div className="h-2 w-2 rounded-full bg-primary-orange" />}
                                        {link.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )
            }
        </nav >
    )
}
