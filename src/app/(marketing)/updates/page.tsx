import Link from "next/link"
import { Calendar, ArrowRight, Newspaper } from "lucide-react"

const UPDATES = [
    {
        title: "Platform Evolution: v2.1.0 Governance & Support Patch",
        excerpt: "We've deployed advanced user oversight tools and persistent guest support to ensure every Hobort interaction is secure and uninterrupted.",
        date: "Feb 19, 2026",
        category: "System",
        slug: "platform-evolution-v2-1-0",
        image: "/gallery/exhibition/23.jpg"
    },
    {
        title: "New Georgia Logistics Center Now Fully Operational",
        excerpt: "We've upgraded our US-side operations to reduce sorting time and improve quality auditing for all Ghana-bound shipments.",
        date: "Feb 15, 2026",
        category: "Operations",
        slug: "new-georgia-logistics-center",
        image: "/gallery/new-arrivals/1.jpg"
    },
    {
        title: "Extended Partnership with Georgia OEM Parts Network",
        excerpt: "Hobort customers now get even better pricing on genuine Toyota and Nissan components thanks to our new direct-supply agreements.",
        date: "Feb 10, 2026",
        category: "Pricing",
        slug: "georgia-oem-partnership",
        image: "/gallery/exhibition/22.jpg"
    }
]

export default function UpdatesPage() {
    return (
        <div className="flex flex-col gap-20 pt-40 pb-20">
            <section className="container max-w-[1400px] mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mx-auto ring-1 ring-slate-100">
                        <Newspaper className="h-3 w-3" /> Latest from Hobort
                    </div>
                    <h1 className="text-5xl font-semibold text-primary-blue md:text-7xl tracking-tight leading-[1.1]">System Updates & News</h1>
                    <p className="text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
                        Stay informed about our logistics network, price adjustments, and new service expansions.
                    </p>
                </div>
            </section>

            <section className="container max-w-[1400px] mx-auto px-6">
                <div className="grid gap-12 max-w-5xl mx-auto">
                    {UPDATES.map((update, i) => (
                        <div key={i} className="group flex flex-col md:flex-row gap-8 items-start pb-12 border-b border-slate-100 last:border-0 transition-all duration-500 hover:bg-slate-50/50 rounded-[2.5rem] -mx-6 px-6">
                            <div className="w-full md:w-[40%] shrink-0">
                                <Link href={`/updates/${update.slug}`} className="block aspect-[16/10] sm:aspect-[16/8] md:aspect-[16/10] rounded-[2rem] bg-slate-100 border border-slate-200 overflow-hidden relative shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200/50 transition-all duration-500">
                                    <img
                                        src={update.image}
                                        alt={update.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-primary-blue text-[9px] font-bold uppercase tracking-widest shadow-sm">
                                        {update.category}
                                    </div>
                                </Link>
                            </div>
                            <div className="flex-1 space-y-4 pt-2">
                                <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                    <Calendar className="h-3 w-3" /> {update.date}
                                </div>
                                <h3 className="text-2xl font-semibold text-primary-blue group-hover:text-primary-orange transition-colors tracking-tight leading-tight">
                                    {update.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    {update.excerpt}
                                </p>
                                <div className="pt-2">
                                    <Link href={`/updates/${update.slug}`} className="inline-flex items-center gap-2 text-primary-orange font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                                        Read Full Article <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
