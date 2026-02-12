"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock, Eye, Server, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { PolicyTabs } from "@/components/marketing/policy-tabs"

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container max-w-[1400px] mx-auto px-6 py-24">
                <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-blue/30 hover:text-primary-blue transition-colors mb-4">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Hub
                </Link>

                <PolicyTabs />

                <div className="space-y-4 mb-16">
                    <h1 className="text-6xl font-semibold text-primary-blue tracking-tighter uppercase leading-none">
                        Privacy <span className="text-primary-orange">Policy</span>
                    </h1>
                    <p className="text-xl font-medium text-primary-blue/60 max-w-2xl leading-relaxed">
                        Security for your data, just as secure as our logistics. How we handle your information on HAPE.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {[
                        { icon: Lock, label: "Secure Data", desc: "Encryption for all VIN and Personal details." },
                        { icon: Eye, label: "No Selling", desc: "We never sell your data to third-party advertisers." },
                        { icon: Server, label: "Protected", desc: "Stored on secure US-based cloud infrastructure." },
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-blue">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <h4 className="text-sm font-semibold text-primary-blue uppercase tracking-tight">{item.label}</h4>
                            <p className="text-xs font-medium text-primary-blue/50 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-12 mb-24">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-primary-blue uppercase tracking-tight flex items-center gap-4">
                            <span className="h-1.5 w-8 bg-primary-orange rounded-full" />
                            Information We Collect
                        </h2>
                        <div className="pl-12 space-y-4 text-sm font-medium text-primary-blue/70 leading-relaxed">
                            <p>
                                To facilitate intercontinental part sourcing, we collect vehicle identification data (VIN), contact information (Email/Phone), and logistics preferences.
                            </p>
                            <p>
                                We use the <Link href="https://vpic.nhtsa.dot.gov/" className="text-primary-orange underline">NHTSA API</Link> to decode your VIN. This data is used solely to ensure the accuracy of the parts catalog we source for you.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-primary-blue uppercase tracking-tight flex items-center gap-4">
                            <span className="h-1.5 w-8 bg-primary-orange rounded-full" />
                            Storage & Security
                        </h2>
                        <div className="pl-12 space-y-4 text-sm font-medium text-primary-blue/70 leading-relaxed">
                            <p>
                                Your data is stored on our secure servers for order history and tracking purposes. Financial transactions are handled by PCI-compliant third-party processors.
                            </p>
                            <p>
                                We implement industry-standard security measures to protect your account information from unauthorized access, including role-based access control and 2FA for portal agents.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-primary-blue uppercase tracking-tight flex items-center gap-4">
                            <span className="h-1.5 w-8 bg-primary-orange rounded-full" />
                            Cookies & Analytics
                        </h2>
                        <div className="pl-12 space-y-4 text-sm font-medium text-primary-blue/70 leading-relaxed">
                            <p>
                                We use basic analytics cookies to understand how our users interact with the sourcing quote form and portal. This helps us optimize the experience and speed of our service.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="p-10 rounded-3xl bg-primary-blue/5 border border-primary-blue/10 flex flex-col md:flex-row items-center gap-8">
                    <ShieldCheck className="h-16 w-16 text-primary-blue shrink-0 animate-pulse" />
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-semibold text-primary-blue uppercase tracking-tight">Your data is safe with Hobort.</h3>
                        <p className="text-xs font-medium text-primary-blue/50 max-w-lg">
                            If you have any specific concerns about your data or wish to request a permanent deletion of your account and sourcing history, please contact our security team.
                        </p>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-[10px] font-semibold text-primary-blue/30 uppercase tracking-[0.2em] mb-4">Last Updated: February 2026</p>
                    <Link href="/contact" className="text-[10px] font-semibold text-primary-blue hover:text-primary-orange uppercase tracking-widest transition-colors">
                        Contact Security Team
                    </Link>
                </div>
            </div>
        </div>
    )
}
