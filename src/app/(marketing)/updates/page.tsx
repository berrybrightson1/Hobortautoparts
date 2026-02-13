import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Zap, Truck, Globe, Clock, Sparkles, CheckCircle2 } from "lucide-react"

const updates = [
    {
        version: "v1.3.0",
        date: "February 13, 2026",
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
        title: "UX & Stability Refinement",
        description: "Focus on mobile responsiveness and input stability to ensure a professional experience on all devices.",
        changes: [
            "Enforced 16px font-size on all mobile inputs to prevent automatic browser zoom-in (common iOS issue).",
            "Resolved hydration mismatches in phone inputs by implementing mounting guards.",
            "Standardized hero subtext to a 3-line rhythm, ensuring a stable layout during slide transitions.",
            "Optimized hero copy phrases (e.g., 'international demand') for better visual balance.",
            "Optimized tracking widget alignment to perfectly match CTA buttons on all screens.",
        ]
    },
    {
        version: "v1.1.0",
        date: "February 12, 2026",
        title: "Premium Hero & Verification System",
        description: "Introduction of high-fidelity design elements and critical vehicle data validation features.",
        changes: [
            "Launched Dynamic Dual-Theme Hero Slider with auto-switching lighting/dark modes.",
            "Implemented 17-point VIN syntax and checksum validation system.",
            "Added NHTSA-powered vehicle decoding with mandatory profile confirmation step.",
            "Integrated industrial-luxury brand showcase with Mercedes, BMW, and Toyota logos.",
        ]
    },
    {
        version: "v1.0.0",
        date: "February 11, 2026",
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

export default function UpdatesPage() {
    return (
        <div className="min-h-screen bg-white pb-20 pt-32">
            <div className="container max-w-[1400px] mx-auto px-6">
                <div className="max-w-3xl mb-16">
                    <Badge className="mb-4 bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 border-none px-4 py-1 text-xs font-bold uppercase tracking-widest">
                        Platform Evolution
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-primary-blue mb-6 font-display">
                        Site Updates <span className="text-primary-orange">&</span> Patch Notes
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Track every refinement and new feature as we build the world&apos;s most reliable intercontinental auto parts supply chain.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {updates.map((update) => (
                            <div key={update.version} className="relative pl-8 border-l-2 border-slate-100 hover:border-primary-orange/30 transition-colors py-2">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary-orange shadow-sm" />

                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <span className="text-sm font-bold text-primary-orange tracking-widest uppercase">
                                        {update.version}
                                    </span>
                                    <span className="text-sm font-medium text-slate-400">
                                        {update.date}
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-primary-blue mb-3">
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
                                Feature Breakdown
                            </h3>

                            <div className="space-y-6 relative z-10">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-5 h-5 text-primary-orange" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">VIN Verification</h4>
                                        <p className="text-xs text-white/60 leading-relaxed uppercase tracking-tight">Technical matching system ensures 100% parts compatibility.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Globe className="w-5 h-5 text-primary-orange" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Global Logistics</h4>
                                        <p className="text-xs text-white/60 leading-relaxed uppercase tracking-tight">Direct channel between US inventory and international demand.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-primary-orange" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Live Tracking</h4>
                                        <p className="text-xs text-white/60 leading-relaxed uppercase tracking-tight">End-to-end milestone visibility for every intercontinental shipment.</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-blue mb-4">Need help?</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-wide leading-relaxed font-medium mb-6">
                                Have questions about a specific update or feature implementation?
                            </p>
                            <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary-blue hover:bg-slate-50 transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
