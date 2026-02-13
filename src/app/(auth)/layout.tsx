"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // Map routes to specific content for a unique branding experience
    const getBrandingContent = () => {
        if (pathname === '/login') {
            return {
                image: '/auth-customer.webp',
                heading: "The Hub for Premium",
                highlight: "Auto Parts Logistics.",
                description: "Efficient sourcing, real-time tracking, and seamless logistics for auto parts worldwide."
            }
        }
        if (pathname === '/signup') {
            return {
                image: '/signup_customer_experience.webp',
                heading: "Join our Global",
                highlight: "Service Network.",
                description: "Experience the standard in automotive supply chain excellence and specialized logistics."
            }
        }
        if (pathname === '/forgot-password' || pathname === '/reset-password') {
            return {
                image: '/auth-hero-concept-bubbles.webp',
                heading: "Secure Access",
                highlight: "Recovery Shield.",
                description: "Restore your specialized portal access through our encrypted security verification system."
            }
        }
        return {
            image: '/auth-customer.webp',
            heading: "The Hub for Premium",
            highlight: "Auto Parts Logistics.",
            description: "Efficient sourcing, real-time tracking, and seamless logistics for auto parts worldwide."
        }
    }

    const { image, heading, highlight, description } = getBrandingContent()

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side: Form */}
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12 bg-white relative">
                <div className="w-full max-w-sm mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-start">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 text-slate-400 hover:text-primary-blue transition-all font-bold text-sm bg-slate-50 px-6 py-3 rounded-full hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Link>
                    </div>
                    {children}

                    <p className="text-center text-xs text-slate-400 font-medium">
                        © {new Date().getFullYear()} Hobort Auto Parts Express. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right side: Branding area */}
            <div className="hidden lg:block relative bg-slate-900 overflow-hidden border-l border-slate-100">
                {/* Background Image with Dynamic Source */}
                <div
                    key={image} // Force re-animation on route change
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[2.5s] animate-in fade-in zoom-in-105"
                    style={{ backgroundImage: `url('${image}')` }}
                />

                {/* Rich Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue via-primary-blue/30 to-transparent z-10 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/20 via-transparent to-primary-orange/20 z-10" />

                <div className="absolute inset-0 z-20 p-16 flex flex-col justify-end">
                    <div className="space-y-4 max-w-lg">
                        <div className="h-1.5 w-12 bg-primary-orange rounded-full shadow-lg" />
                        <h2 className="text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                            {heading} <br />
                            <span className="text-primary-orange">{highlight}</span>
                        </h2>
                        <p className="text-white/80 font-bold text-lg leading-relaxed max-w-sm">
                            {description}
                        </p>
                    </div>
                </div>

                {/* Decorative dots using brand colors */}
                <div className="absolute top-12 right-12 grid grid-cols-4 gap-2 z-20 opacity-20">
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary-blue" />
                    ))}
                </div>
            </div>
        </div>
    )
}
