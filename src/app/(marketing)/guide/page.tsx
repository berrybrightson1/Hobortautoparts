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
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

const updates = [
    {
        version: "v2.6.0",
        date: "March 1, 2026",
        time: "03:17 PM",
        title: "Agent Upgrade Path, Mobile Numbers & Platform Stability",
        description: "A comprehensive update introducing the customer-to-agent upgrade flow, mandatory phone number collection, real-time role synchronisation, and key stability improvements across the portal.",
        changes: [
            "Mobile Number Collection: Phone numbers are now captured at signup for both customers and agents, enabling direct follow-up and improving fulfilment communication.",
            "Phone Number Alert Banner: A dismissible banner prompts existing users without a phone number on file to update their profile, ensuring the contact directory stays complete.",
            "Customer → Agent Upgrade Path: Existing customers can now apply to become a partner agent directly from their profile settings, without creating a new account.",
            "Real-Time Role Synchronisation: The portal now subscribes to live profile changes — when an admin approves an agent, the portal updates instantly without requiring a page refresh.",
            "Pending Approval Modal Fix: The 'Application Under Review' modal now verifies the user's role directly from the database on mount, preventing it from appearing for already-approved agents.",
            "Notification Panel Scrolling: The notification panel is now natively scrollable with a branded Hobort-blue / orange hover scrollbar.",
            "Portal Hydration Mismatch Fixed: Resolved a React server/client hydration error in the portal layout by gating the loading spinner on the mounted flag.",
        ]
    },
    {
        version: "v2.5.0",
        date: "February 28, 2026",
        time: "08:30 PM",
        title: "Hobort Billing Engine & Core Stability",
        description: "A monumental update launching a professional financial invoicing ecosystem, alongside critical stability patches for authentication and user onboarding.",
        changes: [

            "Launched 'Hobort Billing': A professional, text-selectable PDF invoice engine with brand-matched orange aesthetics, generated directly in the browser.",
            "Dynamic Invoice Management: Built a highly interactive 'Create Invoice' dashboard with auto-calculating line items, subtotal math, and global tax application.",
            "Visual Status Architecture: Integrated responsive invoice status badges (Draft, Paid, Overdue) and a modular financial tracking interface.",
            "Fixed OTP Verification Lockup: Transitioned the 'Welcome Email' from a blocking API request to an asynchronous background task, ensuring the UI verification loop never hangs.",
            "Resolved Instant Redirect Bug: Hardened the Global Auth Provider to strictly reject 'ghost' sessions lacking email confirmation, forcing users to complete the mandatory OTP security gate.",
            "Eliminated Registration RLS Errors: Added aggressive pre-fetch validation to prevent the app from fetching user profiles before they are mathematically verified, silencing all database security complaints."
        ]
    },
    {
        version: "v2.4.0",
        date: "February 28, 2026",
        time: "05:50 PM",
        title: "Hobort Billing, Bug Reporting & UI Polish",
        description: "A monumental update transforming Hobort into a full-scale financial and communication ecosystem with professional billing and real-time feedback loops.",
        changes: [
            "Launched 'Hobort Billing': A professional, text-selectable PDF invoice engine with brand-matched orange styling and automated calculations.",
            "Instant Digital Onboarding: Google SSO combined with zero-delay welcome emails and 1-click account access for a friction-free experience.",
            "Role-Based Bug Reporting: A high-fidelity feedback portal with 40+ searchable categories and a dedicated Admin resolution hub.",
            "Navigation Optimization: Completely streamlined the footer and portal navigation, removing 5+ redundant paths for a cleaner, high-end UI.",
            "Unified Platform Layout: Finalized a symmetrical, mobile-first architecture that scales perfectly from iPhone to Ultra-Wide monitors.",
        ]
    },
    {
        version: "v2.3.0",
        date: "February 26, 2026",
        time: "05:45 PM",
        title: "Google SSO & Instant Access",
        description: "Completely streamlined the user onboarding experience with 1-click Google Single Sign-On, Instant Signups without OTP delays, and hardened fake email prevention.",
        changes: [
            "Implemented Google Single Sign-On: Users can now create accounts and log in seamlessly via Google OAuth, automatically linking with existing matching emails.",
            "Instant Signups & Zero-Delay Welcome Emails: Bypassed the mandatory 6-digit OTP email verification screen. Account creation, login, and welcome email delivery are now instant.",
            "Advanced Fake Email Prevention: Deployed a robust frontend validation system containing over 250+ known disposable/burner email domains. Fake email attempts are instantly blocked.",
            "Enforced Strict Role-Based Route Isolation: Upgraded middleware to rigorously prevent users from logging into the wrong portal (e.g., Customers cannot use the Admin login tab).",
            "Enhanced Testimonials Experience: Integrated a scrolling marquee with native pause-on-hover logic, upgraded typography to brand colors, and injected localized user identities.",
        ]
    },
    {
        version: "v2.2.0",
        date: "February 22, 2026",
        time: "11:30 AM",
        title: "Registration Flow & Hydration Fixes",
        description: "Focus on onboarding stability and resolving technical hydration mismatches in the signup process.",
        changes: [
            "Resolved Registration Hydration Mismatch: Fixed the 'Get Started' button submission handler to ensure consistent server/client rendering.",
            "Optimized Post-Signup Redirection: Unified the landing logic after successful account creation for Customer and Agent roles.",
            "Enhanced Field Validation: Added real-time error feedback for registration forms to minimize submission failures.",
        ]
    },
    {
        version: "v2.1.0",
        date: "February 19, 2026",
        time: "12:15 PM",
        title: "Account Governance & Persistent Support",
        description: "Focus on platform stability, secure account recovery, and background persistence for guest support interactions.",
        changes: [
            "Launched Advanced User Governance: Admins can now suspend/unsuspend accounts with unified middleware enforcement.",
            "Implemented Persistent Guest Chat: Conversations now sync to localStorage, ensuring continuity for unauthenticated users.",
            "Deployed Self-Service Recovery: New 'Forgot Password' flow with real-time security strength indicators during reset.",
            "Refined Gallery Masonry: Adjusted layout for 4-column density on ultra-wide screens and better mobile stacking.",
        ]
    },
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

                <Tabs defaultValue="patchnotes" className="space-y-12">
                    <TabsList className="bg-slate-100 p-1.5 rounded-full inline-flex h-auto w-full md:w-auto">
                        <TabsTrigger
                            value="patchnotes"
                            className="rounded-full px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-primary-orange data-[state=active]:shadow-lg transition-all"
                        >
                            <History className="w-4 h-4 mr-2" /> Patch Notes
                        </TabsTrigger>
                        <TabsTrigger
                            value="howto"
                            className="rounded-full px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-primary-orange data-[state=active]:shadow-lg transition-all"
                        >
                            <BookOpen className="w-4 h-4 mr-2" /> Quick Guides
                        </TabsTrigger>
                    </TabsList>


                    {/* TAB 2: HOW-TO GUIDES */}
                    <TabsContent value="howto" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-primary-blue to-slate-900 text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => setIsVideoOpen(true)}>
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
                                            <h4 className="font-bold tracking-tight text-slate-900">Enter Your VIN</h4>
                                            <p className="text-sm text-slate-500 mt-1">Go to <Link href="/quote" className="text-primary-orange underline">/quote</Link> and enter your 17-digit VIN. This unlocks the vehicle detail fields (Year, Make, Model, Trim, Engine) and auto-decodes your vehicle via NHTSA.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shrink-0 shadow-sm">2</div>
                                        <div>
                                            <h4 className="font-bold tracking-tight text-slate-900">Confirm Vehicle & Part</h4>
                                            <p className="text-sm text-slate-500 mt-1">Verify the decoded vehicle details, select the trim and engine, then name the part you need and its condition.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shrink-0 shadow-sm">3</div>
                                        <div>
                                            <h4 className="font-bold tracking-tight text-slate-900">Clarify & Quote</h4>
                                            <p className="text-sm text-slate-500 mt-1">Chat live with agents to confirm part details. Once finalized, you receive a quote alert via email and dashboard notification.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shrink-0 shadow-sm">4</div>
                                        <div>
                                            <h4 className="font-bold tracking-tight text-slate-900">Accept & Pay</h4>
                                            <p className="text-sm text-slate-500 mt-1">Log in to your Dashboard, approve the price, and finalize the order. Note: the initial quote covers the part cost only — shipping to Ghana is quoted separately.</p>
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
                                <Card className="p-8 bg-primary-blue text-white border-none rounded-2xl overflow-hidden relative group">
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
