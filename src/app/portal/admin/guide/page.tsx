'use client'

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    LayoutDashboard, Users, FileText, Settings, HelpCircle,
    PackageSearch, ShoppingBag, Truck, MessageSquare, ArrowRight, CheckCircle2, AlertCircle
} from "lucide-react"

export default function AdminGuidePage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
            <div className="max-w-3xl mb-12">
                <Badge className="mb-4 bg-primary-blue/10 text-primary-blue border-none px-4 py-1.5 text-xs tracking-wide rounded-full font-medium">
                    Admin Quick Start
                </Badge>
                <h1 className="text-3xl md:text-5xl tracking-tight text-slate-900 mb-6 leading-tight font-semibold">
                    Simplicity is key. <span className="text-primary-blue font-medium">Step-by-step workflow.</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    As simple as A, B, C, D. Here is exactly what you do when a customer uses the platform.
                </p>
            </div>

            <div className="space-y-12 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute left-[39px] top-10 bottom-10 w-0.5 bg-slate-100 z-0"></div>

                {/* Step A */}
                <div className="flex gap-6 relative z-10">
                    <div className="shrink-0 mt-1">
                        <div className="h-20 w-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-semibold shadow-lg shadow-slate-900/20">
                            A
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl text-slate-900 tracking-tight font-semibold">Customer makes a Request</h2>
                            <Badge variant="outline" className="text-[10px] uppercase font-medium">Starts Here</Badge>
                        </div>
                        <Card className="border-slate-200 shadow-md p-6 bg-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="space-y-5 relative z-10">
                                <p className="text-slate-600 font-medium">When a customer wants a quote for parts...</p>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <PackageSearch className="w-5 h-5 text-blue-500" />
                                    <span className="text-slate-600 font-medium">Go to <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium">Sourcing Requests</span> on the sidebar.</span>
                                </div>

                                <ul className="space-y-3 pl-2">
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Click on the new request to view details.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Reply with a quote and attach an invoice (Hobort Billing).</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Or, click "Create Order (Proxy)" to bypass the customer and create the order for them.</span>
                                    </li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Step B */}
                <div className="flex gap-6 relative z-10">
                    <div className="shrink-0 mt-1">
                        <div className="h-20 w-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold shadow-lg shadow-blue-600/20">
                            B
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl text-slate-900 tracking-tight font-semibold">Customer pays for the Order</h2>
                        </div>
                        <Card className="border-slate-200 shadow-md p-6 bg-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="space-y-5 relative z-10">
                                <p className="text-slate-600 font-medium">After they accept the quote and make payment...</p>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <ShoppingBag className="w-5 h-5 text-emerald-500" />
                                    <span className="text-slate-600 font-medium">Go to <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">Orders</span> on the sidebar.</span>
                                </div>

                                <ul className="space-y-3 pl-2">
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Find the pending order in the table.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Click the actions menu (•••) on the right side of the row.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Change the status to "Processing" while you gather their items.</span>
                                    </li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Step C */}
                <div className="flex gap-6 relative z-10">
                    <div className="shrink-0 mt-1">
                        <div className="h-20 w-20 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl font-semibold shadow-lg shadow-orange-500/20">
                            C
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl text-slate-900 tracking-tight font-semibold">Items are ready to ship</h2>
                        </div>
                        <Card className="border-slate-200 shadow-md p-6 bg-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="space-y-5 relative z-10">
                                <p className="text-slate-600 font-medium">When you have boxes packed and ready to fly/sail...</p>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <Truck className="w-5 h-5 text-orange-500" />
                                    <span className="text-slate-600 font-medium">Go to <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-medium">Shipments</span> on the sidebar.</span>
                                </div>

                                <ul className="space-y-3 pl-2">
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Click "+ Create Shipment" at the top.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Link it to their Order ID, add a tracking number, and set it to Air or Sea.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Update the progress status (e.g. In Transit, Customs, Delivered) here as the package moves.</span>
                                    </li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Step D */}
                <div className="flex gap-6 relative z-10">
                    <div className="shrink-0 mt-1">
                        <div className="h-20 w-20 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl font-semibold shadow-lg shadow-emerald-500/20">
                            D
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl text-slate-900 tracking-tight font-semibold">Communication & Support</h2>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 font-medium uppercase text-[10px]">Always on</Badge>
                        </div>
                        <Card className="border-slate-200 shadow-md p-6 bg-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="space-y-5 relative z-10">
                                <p className="text-slate-600 font-medium">If you or the customer needs to talk at any point...</p>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <MessageSquare className="w-5 h-5 text-slate-500" />
                                    <span className="text-slate-600 font-medium">Go to <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">Live Support</span> on the sidebar.</span>
                                </div>

                                <ul className="space-y-3 pl-2">
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>This acts as a WhatsApp-style messenger.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>You can reply to customer messages, send files, and clarify order details here.</span>
                                    </li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Step E */}
                <div className="flex gap-6 relative z-10">
                    <div className="shrink-0 mt-1">
                        <div className="h-20 w-20 rounded-2xl bg-[#f97316] text-white flex items-center justify-center text-2xl font-semibold shadow-lg shadow-orange-500/20">
                            E
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl text-slate-900 tracking-tight font-semibold">Monitoring Bug Reports</h2>
                            <Badge className="bg-[#f97316] hover:bg-orange-600 font-medium uppercase text-[10px]">New in v2.2</Badge>
                        </div>
                        <Card className="border-slate-200 shadow-md p-6 bg-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="space-y-5 relative z-10">
                                <p className="text-slate-600 font-medium">If a customer or agent spots something broken on the platform...</p>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-[#f97316]" />
                                    <span className="text-slate-600 font-medium">Open your <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-medium">Profile Card</span> at the bottom of the sidebar → click <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-medium">View Bug Reports</span>.</span>
                                </div>

                                <ul className="space-y-3 pl-2">
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>The badge on that item shows the count of open reports — it goes away when they're all resolved.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Click any report to expand it. You'll see the full description, steps to reproduce, and the page URL where it happened.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-600 font-medium">
                                        <ArrowRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Use the status buttons (<strong>Open → In Progress → Resolved → Dismissed</strong>) to manage each report inline.</span>
                                    </li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Outro */}
                <div className="flex gap-6 relative z-10 pt-4">
                    <div className="shrink-0 w-20 flex justify-center mt-2">
                        <CheckCircle2 className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-500 font-medium italic text-lg mt-2">
                            That is the entire complete loop!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
