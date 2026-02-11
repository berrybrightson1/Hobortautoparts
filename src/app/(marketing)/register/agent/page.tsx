"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserCheck, MapPin, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function AgentRegisterPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-12 shadow-premium border border-slate-100">
                    <div className="flex flex-col gap-8">
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
                                <Input placeholder="John Doe" className="rounded-xl h-12 font-medium" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-700">Primary Location / Region</label>
                                <Input placeholder="e.g. Kumasi, Ashanti Region" className="rounded-xl h-12 font-medium" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-700">Experience in Logistics (Years)</label>
                                <Input type="number" placeholder="2" className="rounded-xl h-12 font-medium" />
                            </div>
                        </div>

                        <Button variant="orange" className="w-full h-16 rounded-2xl text-lg font-semibold">
                            Join Network
                        </Button>

                        <Link href="/services" className="text-center text-slate-400 hover:text-primary-blue transition-colors text-sm font-medium">
                            &larr; Back to services
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
