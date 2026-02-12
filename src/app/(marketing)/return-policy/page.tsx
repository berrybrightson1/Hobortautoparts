"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, ShieldCheck, AlertTriangle, FileText } from "lucide-react"
import Link from "next/link"
import { PolicyTabs } from "@/components/marketing/policy-tabs"

export default function ReturnPolicyPage() {
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
                        Return <span className="text-primary-orange">Policy</span>
                    </h1>
                    <p className="text-xl font-medium text-primary-blue/60 max-w-2xl leading-relaxed">
                        Fair terms for a global supply chain. We stand behind our sourcing quality while maintaining the speed your business requires.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <div className="p-8 rounded-3xl bg-blue-50/50 border border-blue-100 border-dashed">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-primary-blue text-white flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary-blue uppercase tracking-tight">OEM / New Parts</h3>
                        </div>
                        <ul className="space-y-4 text-sm font-medium text-primary-blue/60">
                            <li className="flex gap-3">
                                <CheckIcon className="h-4 w-4 mt-0.5 text-primary-orange shrink-0" />
                                30-Day manufacturer warranty included from arrival date.
                            </li>
                            <li className="flex gap-3">
                                <CheckIcon className="h-4 w-4 mt-0.5 text-primary-orange shrink-0" />
                                Returns accepted for defective or incorrect "Out of Box" items.
                            </li>
                            <li className="flex gap-3">
                                <CheckIcon className="h-4 w-4 mt-0.5 text-primary-orange shrink-0" />
                                Full refund or replacement available for incorrect sourcing.
                            </li>
                        </ul>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 border-dashed">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                <RefreshCw className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary-blue uppercase tracking-tight">Quality Used Parts</h3>
                        </div>
                        <ul className="space-y-4 text-sm font-medium text-primary-blue/60">
                            <li className="flex gap-3">
                                <CheckIcon className="h-4 w-4 mt-0.5 text-primary-orange shrink-0" />
                                7-Day "Test & Verify" period upon pickup in Ghana.
                            </li>
                            <li className="flex gap-3">
                                <CheckIcon className="h-4 w-4 mt-0.5 text-primary-orange shrink-0" />
                                Coverage for non-functional internal components.
                            </li>
                            <li className="flex gap-3 text-red-500/80">
                                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                Note: Exterior cosmetic wear is not covered for used parts.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-16 mb-24">
                    <div className="space-y-12 mb-24">
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <h2 className="text-3xl font-semibold text-primary-blue uppercase tracking-tight">The Verification Process</h2>
                                <p className="text-sm font-medium text-primary-blue/40 uppercase tracking-widest">3-Stage Resolution Pipeline</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    {
                                        step: "01",
                                        title: "Report",
                                        desc: "Submit a return request via the portal within our standard policy window.",
                                        icon: FileText,
                                        color: "bg-blue-50 text-blue-600"
                                    },
                                    {
                                        step: "02",
                                        title: "Review",
                                        desc: "Our US team verifies the sourcing logs, VIN records, and manufacturer data.",
                                        icon: ShieldCheck,
                                        color: "bg-orange-50 text-primary-orange"
                                    },
                                    {
                                        step: "03",
                                        title: "Resolve",
                                        desc: "We issue a hub credit or arrange for a replacement part for your next shipment.",
                                        icon: RefreshCw,
                                        color: "bg-slate-900 text-white"
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-premium transition-all duration-500 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                            <item.icon className="h-24 w-24 -mr-8 -mt-8" />
                                        </div>

                                        <div className="relative z-10 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className={`h-14 w-14 rounded-2xl ${item.color} flex items-center justify-center shadow-md`}>
                                                    <item.icon className="h-7 w-7" />
                                                </div>
                                                <span className="text-4xl font-black text-primary-orange/20 tracking-tighter group-hover:text-primary-orange/40 transition-colors duration-500">{item.step}</span>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-xl font-semibold text-primary-blue uppercase tracking-tight">{item.title}</h4>
                                                <p className="text-sm font-medium text-primary-blue/50 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-orange/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-10 space-y-8">
                            <div className="flex items-start gap-6">
                                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="h-6 w-6 text-primary-orange" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-primary-blue uppercase tracking-tight">Ineligible Returns</h3>
                                    <p className="text-sm font-medium text-primary-blue/60 leading-relaxed">
                                        Parts that have been installed beyond the test phase, modified, or damaged during local installation are strictly ineligible for return. Custom ordered performance parts (Special Order) are non-refundable once shipped from the US hub.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                    <FileText className="h-6 w-6 text-primary-blue" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-primary-blue uppercase tracking-tight">Restocking Fees</h3>
                                    <p className="text-sm font-medium text-primary-blue/60 leading-relaxed">
                                        Returns due to "Customer Error" (Incorrect VIN provided or part no longer needed) are subject to a 20% restocking fee plus the cost of intercontinental return logistics.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-6">
                        <p className="text-[10px] font-semibold text-primary-blue/30 uppercase tracking-[0.2em]">Questions about a specific part? Our sourcing agents are here to help.</p>
                        <Link href="/contact">
                            <Button variant="outline" className="h-14 px-12 rounded-xl border-2 border-primary-blue/10 text-primary-blue font-black hover:bg-primary-blue/5 text-[10px] uppercase tracking-widest">
                                Speak to an Agent
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
