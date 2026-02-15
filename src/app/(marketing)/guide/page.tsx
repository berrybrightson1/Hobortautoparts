"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
    ShieldCheck, Zap, Truck, Globe, Clock, Sparkles, CheckCircle2,
    LayoutDashboard, Users, FileText, Settings, HelpCircle,
    BookOpen, PlayCircle, History, ArrowRight, ExternalLink
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { VideoModal } from "@/components/marketing/video-modal"

const updates = [
    {
        version: "v2.0.0",
        date: "February 15, 2026",
        time: "01:15 PM",
        title: "Real-time Communication & Premium UI",
        description: "Transformed the platform into a high-fidelity communication ecosystem with real-time messaging and symmetrical modal architecture.",
        changes: [
            "Integrated Live Feedback System: Real-time chat between Agents and Customers powered by Supabase.",
            "Launched Apple-style Symmetrical Modals: Redesigned window architecture for better focus and aesthetics.",
            "Eliminated Modal Scrolling: Optimized vertical layout with flex-grow containers and scroll-free viewports.",
            "Enhanced Accessibility: Universal contrast uplift for labels (slate-400 -> slate-600) across all dashboards.",
            "Unified Admin Controls: Direct 'Chat' access from all data tables and dashboards.",
        ]
    },
    {
        version: "v1.9.1",
        date: "February 15, 2026",
        time: "11:30 AM",
        title: "Platform Guide & Tracking Intelligence",
        description: "Launched the dedicated Platform Guide for comprehensive user education and enabled instant Tracking ID access.",
        changes: [
            "Launched /guide: A central hub for Site Structure, How-To's, and Patch Notes.",
            "Deployed 'Reference ID' Badges: Instantly copy tracking numbers from Customer/Agent dashboards.",
            "Implemented Admin-Triggered ID Logic: Reference IDs are now generated only upon Admin review.",
            "Unified Navigation: Added 'Guide' to global Navbar and Footer.",
        ]
    },
    {
        version: "v1.8.0",
        date: "February 14, 2026",
        time: "01:00 PM",
        title: "Optimistic UI & UX Polish",
        description: "Enhanced perceived performance with Skeleton UI and streamlined navigation for a smoother portal experience.",
        changes: [
            "Implemented High-Fidelity Skeleton UI across all dashboards (Customer, Agent, Admin).",
            "Removed redundant 'Homepage' link from sidebar to maximize focus and space.",
            "Simplified Admin Settings with premium 'Coming Soon' placeholders for future modules.",
            "Resolved Agent Dashboard data synchronization regressions.",
            "Optimized global loading states for industrial-scale speed.",
        ]
    },
    {
        version: "v1.7.0",
        date: "February 14, 2026",
        time: "04:05 AM",
        title: "Core Operations Focus",
        description: "Simplified the Administrative suite to focus purely on sourcing efficiency and professional quoting.",
        changes: [
            "De-cluttered the Admin Sidebar: Removed Revenue, Orders, and Shipment management for future restructuring.",
            "Optimized Admin Overview: Replaced financial metrics with Active Sourcing volume and platform growth tracking.",
            "Unified Portal Navigation: Eliminated layout glitches by consolidating all roles into a single stable architecture.",
            "Launched 'Accept & Pay' Bridge: Enabled customers to finalize quotes, initializing the order lifecycle.",
        ]
    },
    {
        version: "v1.6.0",
        date: "February 13, 2026",
        time: "07:34 PM",
        title: "Complete Portal Ecosystem",
        description: "Launched the full-scale portal experience with integrated logistics, finance, and personalized settings.",
        changes: [
            "Deployed Integrated Shipments Manager with real-time DHL/FedEx tracking sync.",
            "Launched Financial Analytics Dashboard with live revenue/quote metric tracking.",
            "Implemented Advanced User Preferences for Dark Mode and Layout Density.",
            "Integrated Instant Push Notifications for Agent Approval workflows.",
            "Deployed Production Database Schema for Logistics and Transaction monitoring.",
        ]
    },
    {
        version: "v1.5.0",
        date: "February 13, 2026",
        time: "10:54 AM",
        title: "Advanced Password Recovery",
        description: "Implemented a secure, multi-stage password recovery system to prevent user lockout.",
        changes: [
            "Launched /forgot-password request page with email validation.",
            "Created /reset-password landing page for secure credential updates.",
            "Integrated Supabase Auth recovery link protocol with custom redirection.",
            "Enforced unified security standards across all recovery routes.",
        ]
    },
    {
        version: "v1.4.0",
        date: "February 13, 2026",
        time: "10:52 AM",
        title: "Intelligent Password Security",
        description: "Enhanced authentication security with real-time feedback and visibility controls.",
        changes: [
            "Developed unified PasswordInput component with high-fidelity Eye toggle.",
            "Integrated real-time Password Strength Meter with 5-point verification.",
            "Added dynamic visual feedback (Weak, Medium, Strong) using brand color palettes.",
            "Enforced mobile-safe input standards for all security fields.",
        ]
    },
    {
        version: "v1.3.0",
        date: "February 13, 2026",
        time: "10:36 AM",
        title: "Supabase Production Infrastructure",
        description: "Migration from mock data to a scalable, real-time PostgreSQL backend with integrated security.",
        changes: [
            "Implemented Global Auth Provider using Supabase Auth for session management.",
            "Deployed production-ready Database Schema (Profiles, Agents, Requests, Shipments).",
            "Launched Dynamic Auth Visuals with route-specific branding for Login/Signup.",
            "Integrated automatic profile creation via PostgreSQL triggers.",
            "Established secure Row Level Security (RLS) policies for data privacy.",
        ]
    },
    {
        version: "v1.2.0",
        date: "February 13, 2026",
        time: "09:45 AM",
        title: "UX & Stability Refinement",
        description: "Focus on mobile responsiveness and input stability to ensure a professional experience on all devices.",
        changes: [
            "Enforced 16px font-size on all mobile inputs to prevent automatic browser zoom-in.",
            "Resolved hydration mismatches in phone inputs by implementing mounting guards.",
            "Standardized hero subtext to a 3-line rhythm for visual stability.",
            "Optimized tracking widget alignment to perfectly match CTA buttons.",
        ]
    },
    {
        version: "v1.1.0",
        date: "February 12, 2026",
        time: "06:30 PM",
        title: "Premium Hero & Verification System",
        description: "Introduction of high-fidelity design elements and critical vehicle data validation features.",
        changes: [
            "Launched Dynamic Dual-Theme Hero Slider (Light/Dark mode).",
            "Implemented 17-point VIN syntax and checksum validation system.",
            "Added NHTSA-powered vehicle decoding with mandatory profile confirmation.",
            "Integrated industrial-luxury brand showcase with automotive leader logos.",
        ]
    },
    {
        version: "v1.0.0",
        date: "February 11, 2026",
        time: "12:00 PM",
        title: "Initial Platform Launch",
        description: "The core foundation of Hobort Auto Parts Express, establishing the intercontinental supply chain link.",
        changes: [
            "Established base global layout with max-width [1400px] standardization.",
            "Integrated real-time WhatsApp redirect flow for instant agent communication.",
            "Launched sourcing request forms with dynamic multi-step logic.",
            "Optimized global navigation and footer for high-performance accessibility.",
        ]
    }
]

export default function GuidePage() {
    const [isVideoOpen, setIsVideoOpen] = useState(false)

    return (
        <div className="min-h-screen bg-white pb-20 pt-32">
            <div className="container max-w-[1400px] mx-auto px-6">
                <div className="max-w-3xl mb-12">
                    <Badge className="mb-4 bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 border-none px-4 py-1.5 text-xs font-bold tracking-wide rounded-full">
                        Platform Guide
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-primary-blue mb-6 font-display leading-[0.9]">
                        How to Navigate <br /><span className="text-primary-orange">Our Ecosystem.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium max-w-2xl">
                        A complete breakdown of the Hobort Auto Parts Express platform, designed to help you source, track, and manage your global automotive supply chain.
                    </p>
                </div>

                <Tabs defaultValue="structure" className="space-y-12">
                    <TabsList className="bg-slate-100 p-1.5 rounded-full inline-flex h-auto w-full md:w-auto">
                        <TabsTrigger
                            value="structure"
                            className="rounded-full px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-primary-orange data-[state=active]:shadow-lg transition-all"
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Site Structure
                        </TabsTrigger>
                        <TabsTrigger
                            value="howto"
                            className="rounded-full px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-primary-orange data-[state=active]:shadow-lg transition-all"
                        >
                            <BookOpen className="w-4 h-4 mr-2" /> Quick Guides
                        </TabsTrigger>
                        <TabsTrigger
                            value="patchnotes"
                            className="rounded-full px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-primary-orange data-[state=active]:shadow-lg transition-all"
                        >
                            <History className="w-4 h-4 mr-2" /> Patch Notes
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: SITE STRUCTURE */}
                    <TabsContent value="structure" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">

                        {/* Public Marketing */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary-blue">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Public Platform</h2>
                                    <p className="text-slate-500 font-medium">Accessible to all visitors without login.</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <Card className="border-slate-100 shadow-lg hover:shadow-xl hover:border-primary-orange/20 transition-all group cursor-pointer" id="homepage">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-primary-orange transition-colors">Homepage</CardTitle>
                                        <CardDescription>The central hub. Access vehicle sourcing, tracking, and platform overview.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href="/">
                                            <Button variant="outline" className="w-full rounded-xl text-xs font-bold uppercase tracking-wide group-hover:bg-primary-orange group-hover:text-white group-hover:border-primary-orange transition-all">
                                                Visit Homepage <ArrowRight className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-100 shadow-lg hover:shadow-xl hover:border-primary-orange/20 transition-all group cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-primary-orange transition-colors">Tracking Hub</CardTitle>
                                        <CardDescription>Real-time shipment status checker. No login required for basic visibility.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href="/track">
                                            <Button variant="outline" className="w-full rounded-xl text-xs font-bold uppercase tracking-wide group-hover:bg-primary-orange group-hover:text-white group-hover:border-primary-orange transition-all">
                                                Track Shipment <ArrowRight className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-100 shadow-lg hover:shadow-xl hover:border-primary-orange/20 transition-all group cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-primary-orange transition-colors">Sourcing Request</CardTitle>
                                        <CardDescription>The starting point. Submit vehicle details to get a custom quote.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href="/quote">
                                            <Button variant="outline" className="w-full rounded-xl text-xs font-bold uppercase tracking-wide group-hover:bg-primary-orange group-hover:text-white group-hover:border-primary-orange transition-all">
                                                Start Request <ArrowRight className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* Customer Portal */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary-orange">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customer Portal</h2>
                                    <p className="text-slate-500 font-medium">Secure area for managing your orders and quotes.</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="bg-slate-900 text-white border-none shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold tracking-tight">Dashboard Overview</CardTitle>
                                        <CardDescription className="text-slate-400">View active requests, track shipments and chat directly with your sourcing agent in real-time.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href="/portal/customer">
                                            <Button className="w-full rounded-xl text-xs font-bold uppercase tracking-wide bg-white text-slate-900 hover:bg-primary-orange hover:text-white transition-all">
                                                Login to Dashboard <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>

                                <div className="grid gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <h4 className="font-bold tracking-tight text-slate-900 mb-1">Quote Management</h4>
                                        <p className="text-sm text-slate-500">Review agent pricing, accept quotes, and process payments.</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <h4 className="font-bold tracking-tight text-slate-900 mb-1">Live Tracking</h4>
                                        <p className="text-sm text-slate-500">Visual timeline of your order from US warehouse to delivery.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Agent/Admin Portal */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agent Command</h2>
                                    <p className="text-slate-500 font-medium">Tools for sourcing agents and system administrators.</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="border-slate-100 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold tracking-tight text-slate-900">Sourcing Pipeline</CardTitle>
                                        <CardDescription>Admins view incoming requests and assign quotes.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm text-slate-500 mb-4">
                                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Real-time Customer Messaging</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Generate Symmetrical Price Quotes</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Manage Advanced Logistics & Feedback</li>
                                        </ul>
                                        <Link href="/portal/admin">
                                            <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-wide text-slate-400 hover:text-slate-900">
                                                Access Restricted <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                    </TabsContent>

                    {/* TAB 2: HOW-TO GUIDES */}
                    <TabsContent value="howto" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-primary-blue to-slate-900 text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => setIsVideoOpen(true)}>
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 text-center md:text-left">
                                    <Badge className="bg-primary-orange text-white border-none px-3 py-1 tracking-wide">Featured Guide</Badge>
                                    <h2 className="text-3xl font-bold tracking-tighter">How it Works: Video Tour</h2>
                                    <p className="text-slate-300 max-w-md">Watch a comprehensive walkthrough of the entire sourcing process, from request to delivery.</p>
                                </div>
                                <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                                    <PlayCircle className="w-10 h-10 text-white fill-current opacity-90" />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold tracking-tight text-slate-900">Buying a Part</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shrink-0 shadow-sm">1</div>
                                        <div>
                                            <h4 className="font-bold tracking-tight text-slate-900">Submit Request</h4>
                                            <p className="text-sm text-slate-500 mt-1">Go to <Link href="/quote" className="text-primary-orange underline">/quote</Link> and enter your Vehicle details.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shrink-0 shadow-sm">2</div>
                                        <div>
                                            <h4 className="font-bold tracking-tight text-slate-900">Clarify & Quote</h4>
                                            <p className="text-sm text-slate-500 mt-1">Chat live with agents to confirm part details. once finalized, you receive your quote alert.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shrink-0 shadow-sm">3</div>
                                        <div>
                                            <h4 className="font-bold tracking-tight text-slate-900">Accept & Pay</h4>
                                            <p className="text-sm text-slate-500 mt-1">Log in to your Dashboard, approve the price, and finalize the order.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold tracking-tight text-slate-900">Tracking Your Shipment</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shrink-0 shadow-sm">1</div>
                                        <div>
                                            <h4 className="font-bold tracking-tight text-slate-900">Get Reference ID</h4>
                                            <p className="text-sm text-slate-500 mt-1">Found in your Dashboard next to your order (e.g., Ref: 1e019f96).</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shrink-0 shadow-sm">2</div>
                                        <div>
                                            <h4 className="font-bold tracking-tight text-slate-900">Enter in Tracker</h4>
                                            <p className="text-sm text-slate-500 mt-1">Visit <Link href="/track" className="text-primary-orange underline">/track</Link> or use the widget on the Homepage.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 3: PATCH NOTES (Legacy Updates) */}
                    <TabsContent value="patchnotes" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-12">
                                {updates.map((update) => (
                                    <div key={update.version} className="relative pl-8 border-l-2 border-slate-100 hover:border-primary-orange/30 transition-colors py-2">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary-orange shadow-sm" />

                                        <div className="flex flex-wrap items-center gap-4 mb-4">
                                            <span className="text-sm font-bold text-primary-orange uppercase tracking-wide">
                                                {update.version}
                                            </span>
                                            <span className="text-sm font-medium text-slate-400">
                                                {update.date} • {update.time}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl font-bold tracking-tight text-primary-blue mb-3">
                                            {update.title}
                                        </h2>
                                        <p className="text-slate-600 mb-6 font-medium leading-relaxed">
                                            {update.description}
                                        </p>

                                        <ul className="space-y-3">
                                            {update.changes.map((change, i) => (
                                                <li key={i} className="flex items-start gap-3 group">
                                                    <CheckCircle2 className="w-5 h-5 text-primary-orange shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    <span className="text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                                                        {change}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-8">
                                <Card className="p-8 bg-primary-blue text-white border-none rounded-[2rem] overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                                    <h3 className="text-xl font-bold mb-6 relative z-10 uppercase tracking-widest text-primary-orange">
                                        System Status
                                    </h3>
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white/70">API Gateway</span>
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Operational</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white/70">Database (RLS)</span>
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Secure</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white/70">Payment Bridge</span>
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Active</Badge>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <VideoModal open={isVideoOpen} onOpenChange={setIsVideoOpen} />
        </div>
    )
}
