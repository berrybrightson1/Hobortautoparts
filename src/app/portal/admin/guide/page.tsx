'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
    ShieldCheck, Zap, Truck, Globe, Clock, Sparkles, CheckCircle2,
    LayoutDashboard, Users, FileText, Settings, HelpCircle,
    BookOpen, PlayCircle, History, ArrowRight, ExternalLink,
    Package,
    ShoppingBag,
    DollarSign,
    AlertCircle,
    Plane,
    Ship,
    MapPin,
    BellRing,
    MessageSquare
} from "lucide-react"
import Link from "next/link"

export default function AdminGuidePage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="max-w-3xl mb-8">
                <Badge className="mb-4 bg-primary-blue/10 text-primary-blue hover:bg-primary-blue/20 border-none px-4 py-1.5 text-xs font-bold tracking-wide rounded-full">
                    Admin Documentation
                </Badge>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-slate-900 mb-6 font-display leading-[0.9]">
                    Operations <span className="text-primary-blue">Manual.</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">
                    Standard Operating Procedures (SOPs) for managing orders, logistics, and platform data.
                </p>
            </div>

            <Tabs defaultValue="workflow" className="space-y-12">
                <TabsList className="bg-slate-100 p-1.5 rounded-full inline-flex h-auto w-full md:w-auto">
                    <TabsTrigger
                        value="workflow"
                        className="rounded-full px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-lg transition-all"
                    >
                        <Zap className="w-4 h-4 mr-2" /> Core Workflows
                    </TabsTrigger>
                    {/* Add more tabs like 'User Management' or 'System' later if needed */}
                </TabsList>

                {/* TAB 1: WORKFLOWS */}
                <TabsContent value="workflow" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">

                    {/* Section 1: Order Management */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">1. Order Management</h2>
                                <p className="text-slate-500 font-medium">Processing payments and preparing orders.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-1 gap-6">
                            <Card className="border-slate-100 shadow-lg p-6">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">Locate & Assess</h3>
                                            <p className="text-slate-500 mt-1">Navigate to <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">Orders</span> page. Identify orders with status <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-100">Pending Payment</Badge> or <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-100">Paid</Badge>.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">Update Payment Status</h3>
                                            <p className="text-slate-500 mt-1">Click the <span className="font-bold">Actions Result (•••)</span> menu on the right of the order row.</p>
                                            <ul className="mt-2 space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>Mark Paid:</strong> If customer paid offline/manually.</li>
                                                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> <strong>Mark Processing:</strong> When you begin purchasing items.</li>
                                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-500" /> <strong>Mark Completed:</strong> Only for local pickup/no shipping.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        <div className="flex items-start gap-4">
                                            <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">Agent Proxy Ordering</h3>
                                                <p className="text-slate-500 mt-1">Admins and assigned Agents can now create orders on behalf of customers directly from a Sourcing Request. Look for the <span className="font-bold text-orange-600 italic">"Create Order (Proxy)"</span> button inside the Request Details modal.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Section 2: Logistics Initialization */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">2. Initializing Logistics</h2>
                                <p className="text-slate-500 font-medium">Creating the tracking link for the customer.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-1 gap-6">
                            <Card className="border-slate-100 shadow-lg p-6">
                                <div className="space-y-6">
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                                        <p className="text-blue-800 text-sm font-medium"><AlertCircle className="w-4 h-4 inline mr-2 mb-0.5" /> <strong>Prerequisite:</strong> Ensure you have the physical items and are ready to ship.</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg">Create Shipment</h3>
                                                    <p className="text-slate-500 mt-1">Go to <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">Global Logistics</span> page. Click the <Button size="sm" className="h-6 px-2 text-[10px] bg-slate-900 text-white ml-2 pointer-events-none">+ Create Shipment</Button> button.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg">Link Order</h3>
                                                    <p className="text-slate-500 mt-1">Search for the <strong>Order ID</strong> or <strong>Customer Name</strong> in the modal.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg">Assign Tracking</h3>
                                                    <p className="text-slate-500 mt-1">Enter your generated <strong>Tracking Number</strong> (e.g., TRK-123456).</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">4</div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg">Set Route</h3>
                                                    <p className="text-slate-500 mt-1">Select <strong>Air</strong> or <strong>Sea</strong> freight and define the origin/destination hubs.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Section 3: Tracking Updates */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">3. Updating the Journey</h2>
                                <p className="text-slate-500 font-medium">Moving the package through its lifecycle stages.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-1 gap-6">
                            <Card className="border-slate-100 shadow-lg p-6 bg-slate-900 text-white">
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-sm shrink-0">!</div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">How to Update</h3>
                                            <p className="text-slate-400 mt-1">In the Logistics table, find the shipment &rarr; Click Actions (•••) &rarr; Select the new stage.</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-4">
                                        <div className="p-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
                                            <Plane className="w-6 h-6 text-sky-400 mb-3" />
                                            <h4 className="font-bold text-sm uppercase tracking-wider mb-2">In Transit</h4>
                                            <p className="text-xs text-slate-400">Package has departed origin hub (Air or Sea).</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
                                            <AlertCircle className="w-6 h-6 text-orange-400 mb-3" />
                                            <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Customs</h4>
                                            <p className="text-xs text-slate-400">Undergoing clearance at borders.</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
                                            <MapPin className="w-6 h-6 text-emerald-400 mb-3" />
                                            <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Pickup Ready</h4>
                                            <p className="text-xs text-slate-400">Arrived at destination hub for collection.</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-3" />
                                            <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Delivered</h4>
                                            <p className="text-xs text-slate-400">Handed over to customer.</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Section 4: Real-time Communication */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">4. Engagement & Notifications</h2>
                                <p className="text-slate-500 font-medium">Keeping the bridge active with customers.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-1 gap-6">
                            <Card className="border-slate-100 shadow-lg p-8">
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <BellRing className="w-5 h-5 text-primary-orange" /> Automatic Alerts
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            The system automatically notifies customers via **Interactive Popups** and **Real-time Notifications** when:
                                        </p>
                                        <ul className="space-y-2 text-sm text-slate-600">
                                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> A quote is sent or updated.</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> An order status changes.</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> A tracking update is posted.</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-primary-blue" /> Live Support Quick Actions
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Use the floating **"Messages" pill** at the bottom right to quickly respond to customer queries without leaving your current workflow.
                                        </p>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 italic text-[11px] text-slate-400">
                                            "Pro Tip: Faster response times lead to higher sourcing success rates."
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Section 5: Governance & Security */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">5. Governance & Security</h2>
                                <p className="text-slate-500 font-medium">Protecting the platform and managing users.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-slate-100 shadow-lg p-6">
                                <h3 className="font-bold text-slate-900 text-lg mb-4">User Suspension</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Admins can revoke platform access for any user. Suspended users are immediately redirected to a blockade page.
                                </p>
                                <ul className="space-y-2 text-xs text-slate-600">
                                    <li className="flex items-center gap-2"><History className="w-4 h-4" /> Go to **User Network**.</li>
                                    <li className="flex items-center gap-2"><History className="w-4 h-4" /> Click the (•••) menu.</li>
                                    <li className="flex items-center gap-2"><History className="w-4 h-4" /> Select **Suspend Access**.</li>
                                </ul>
                            </Card>
                            <Card className="border-slate-100 shadow-lg p-6">
                                <h3 className="font-bold text-slate-900 text-lg mb-4">Security Overrides</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Admins can trigger manual password resets for users experiencing lockout issues or security breaches.
                                </p>
                                <ul className="space-y-2 text-xs text-slate-600">
                                    <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary-orange" /> Use the **Reset Password** action in the User table.</li>
                                    <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary-orange" /> System logs all manual credential overrides.</li>
                                </ul>
                            </Card>
                        </div>
                    </section>
                </TabsContent>
            </Tabs>
        </div>
    )
}
