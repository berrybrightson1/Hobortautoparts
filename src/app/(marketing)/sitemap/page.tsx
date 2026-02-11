"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Map, Globe, Shield, User, Car, Zap } from "lucide-react"
import Link from "next/link"

export default function SitemapPage() {
    const sections = [
        {
            title: "Corporate & Marketing",
            icon: Globe,
            links: [
                { name: "Home Hub", href: "/" },
                { name: "About Hobort", href: "/about" },
                { name: "Our Services", href: "/services" },
                { name: "Contact Hub", href: "/contact" }
            ]
        },
        {
            title: "Sourcing & Logistics",
            icon: Zap,
            links: [
                { name: "New Sourcing Request", href: "/quote" },
                { name: "Track Order", href: "/portal" }, // Redirects to tracker/id logic
                { name: "Fleet Solutions", href: "/register/fleet" },
                { name: "Agent Network", href: "/register/agent" }
            ]
        },
        {
            title: "Legal & Policies",
            icon: Shield,
            links: [
                { name: "Shipping Policy", href: "/shipping-policy" },
                { name: "Return Policy", href: "/return-policy" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Sitemap", href: "/sitemap" }
            ]
        },
        {
            title: "Client Portal",
            icon: User,
            links: [
                { name: "Sign In", href: "/login" },
                { name: "Client Signup", href: "/signup" },
                { name: "Dashboard", href: "/portal/customer" },
                { name: "Admin Entry", href: "/portal/admin" }
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-24">
                <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-blue/30 hover:text-primary-blue transition-colors mb-12">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Hub
                </Link>

                <div className="space-y-4 mb-20 text-center md:text-left">
                    <h1 className="text-6xl font-semibold text-primary-blue tracking-tighter uppercase leading-none">
                        Site<span className="text-primary-orange">map</span>
                    </h1>
                    <p className="text-xl font-medium text-primary-blue/60 max-w-2xl leading-relaxed">
                        A complete navigational index of the Hobort Auto Parts Express intercontinental network.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    {sections.map((section, i) => (
                        <div key={i} className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="h-10 w-10 rounded-xl bg-primary-blue/5 text-primary-blue flex items-center justify-center group-hover:bg-primary-blue group-hover:text-white transition-all">
                                    <section.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary-blue uppercase tracking-tight">{section.title}</h3>
                            </div>
                            <div className="grid gap-3 pl-14">
                                {section.links.map((link, j) => (
                                    <Link
                                        key={j}
                                        href={link.href}
                                        className="text-sm font-medium text-primary-blue/50 hover:text-primary-orange transition-colors flex items-center gap-2 group/link"
                                    >
                                        <div className="h-1 w-1 rounded-full bg-slate-200 group-hover/link:bg-primary-orange transition-all" />
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-10 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-6">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Map className="h-8 w-8 text-primary-blue" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-primary-blue uppercase tracking-tight">Can't find what you're looking for?</h3>
                        <p className="text-xs font-medium text-primary-blue/50 max-w-md">
                            Our global sourcing agents are available to assist with custom vehicle requirements or specific logistics inquiries.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Link href="/contact">
                            <Button className="bg-primary-blue text-white hover:bg-hobort-blue-dark font-semibold px-12 h-14 rounded-xl uppercase tracking-widest text-[10px] shadow-xl shadow-primary-blue/10">
                                Contact Support Hub
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
