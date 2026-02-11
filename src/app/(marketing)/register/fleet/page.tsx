"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Package, Truck } from "lucide-react"
import Link from "next/link"

export default function FleetRegisterPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-12 shadow-premium border border-slate-100">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary-blue/5 flex items-center justify-center text-primary-blue">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <h1 className="text-4xl font-semibold text-primary-blue tracking-tight">Fleet Partnership</h1>
                            <p className="text-slate-500 font-medium">Register your transportation or logistics company for bulk rates and portal access.</p>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-700">Company Name</label>
                                <Input placeholder="e.g. West African Logistics" className="rounded-xl h-12 font-medium" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-700">Fleet Size</label>
                                <Input type="number" placeholder="Number of vehicles" className="rounded-xl h-12 font-medium" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-slate-700">Business Registration Number</label>
                                <Input placeholder="GST / VAT / TIN" className="rounded-xl h-12 font-medium" />
                            </div>
                        </div>

                        <Button className="w-full bg-primary-blue hover:bg-primary-blue/90 h-16 rounded-2xl text-lg font-semibold">
                            Submit Application
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
