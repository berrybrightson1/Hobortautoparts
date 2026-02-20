import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"
import { Circle, Layers, Zap, Shield, Box, Users } from "lucide-react"

export const metadata: Metadata = {
    title: "Our Services | Hobort Auto Parts Express",
    description: "Specialized sourcing for Toyota, Honda, Ford, and Mercedes-Benz parts. Genuine US auto parts delivered to Ghana with extreme precision.",
    keywords: ["US auto parts Ghana", "Toyota parts Ghana", "Honda parts sourcing", "Genuine car parts", "Shipping to Ghana"],
}

const SERVICES_GRID = [
    {
        icon: Circle,
        title: "MAJOR BRAND OEM",
        description: "Toyota, Honda, Ford, Nissan, Mercedes, BMW, Kia, Hyundai.",
    },
    {
        icon: Layers,
        title: "VERIFIED AFTERMARKET",
        description: "Bosch, Dorman, ACDelco, Monroe, and elite certified brands.",
    },
    {
        icon: Zap,
        title: "MECHANICAL UNITS",
        description: "Engines (New & Used), Transmissions, Gearboxes.",
    },
    {
        icon: Shield,
        title: "CRITICAL CONTROL",
        description: "Sensors, Pumps, Modules, AC Compressors, Cooling.",
    },
    {
        icon: Box,
        title: "SUSPENSION & BODY",
        description: "Shock Absorbers, Fenders, Bumpers, Doors, Lights.",
    },
    {
        icon: Users,
        title: "FLEET SOLUTIONS",
        description: "Bulk procurement and priority support for professional fleets.",
    },
]

export default function ServicesPage() {
    return (
        <div className="flex flex-col pt-40 pb-20">

            {/* Hero */}
            <section className="container max-w-[1400px] mx-auto px-6 pb-20 text-center">
                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-orange">What We Source</p>
                    <h1 className="text-5xl md:text-7xl font-semibold text-primary-blue tracking-tight leading-[1.05]">
                        Every Part.<br />
                        <span className="text-primary-orange">Every Market.</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
                        From single sensors to complete engines, we handle the complexity of international US-to-Ghana auto parts sourcing.
                    </p>
                </div>
            </section>

            {/* Bordered Grid — matches reference image */}
            <section className="container max-w-[1400px] mx-auto px-6">
                <div className="border border-slate-200 divide-y divide-slate-200">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                        {SERVICES_GRID.slice(0, 3).map((service) => {
                            const Icon = service.icon
                            return (
                                <div key={service.title} className="p-10 md:p-12 flex flex-col gap-5 bg-white hover:bg-slate-50/60 transition-colors">
                                    <Icon strokeWidth={1.5} className="h-7 w-7 text-primary-orange" />
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary-blue">
                                            {service.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                            {service.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                        {SERVICES_GRID.slice(3, 6).map((service) => {
                            const Icon = service.icon
                            return (
                                <div key={service.title} className="p-10 md:p-12 flex flex-col gap-5 bg-white hover:bg-slate-50/60 transition-colors">
                                    <Icon strokeWidth={1.5} className="h-7 w-7 text-primary-orange" />
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary-blue">
                                            {service.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                            {service.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Optional extra section: How sourcing works */}
            <section className="container max-w-[1400px] mx-auto px-6 pt-24">
                <div className="border-t border-slate-100 pt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { step: "01", title: "Submit Request", body: "Fill in your vehicle details and the part you need. VIN decoding auto-fills your vehicle profile." },
                        { step: "02", title: "We Source It", body: "Our US-based network locates the exact part — OEM, aftermarket, or quality used — within 24 hours." },
                        { step: "03", title: "Delivered to Ghana", body: "Sea or air freight to Tema Port then to your door, tracked the entire way." },
                    ].map(({ step, title, body }) => (
                        <div key={step} className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-orange">{step}</p>
                            <h3 className="text-lg font-semibold text-primary-blue">{title}</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">{body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="container max-w-[1400px] mx-auto px-6 pt-24 pb-12">
                <div className="rounded-2xl bg-[#0c1425] p-10 md:p-24 text-center flex flex-col items-center gap-8 relative overflow-hidden border border-white/5">
                    <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl mx-auto">
                        <div className="space-y-5 text-white">
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.85]">
                                Join the Global <span className="text-primary-orange">Sourcing</span> Network
                            </h2>
                            <p className="text-base md:text-xl text-blue-100/70 leading-relaxed font-medium max-w-xl mx-auto">
                                Bridge the gap between international suppliers and local markets.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register/agent">
                                <Button className="rounded-2xl px-10 h-14 text-sm font-black text-white uppercase tracking-widest bg-primary-orange hover:bg-orange-600 border-0 shadow-2xl">
                                    Launch Agent Partnership
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" className="rounded-2xl px-10 h-14 text-sm font-black transition-all hover:bg-white/10 text-white border-white/20 uppercase tracking-widest bg-transparent">
                                    Contact Support
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_2px,transparent_1px)] [background-size:48px_48px]" />
                    </div>
                </div>
            </section>
        </div>
    )
}
