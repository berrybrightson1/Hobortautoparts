"use client"

import React from "react"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { Calendar, ArrowLeft, Newspaper, Share2, Clock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const UPDATES = [
    {
        title: "New Georgia Logistics Center Now Fully Operational",
        content: `
            <p>We are thrilled to announce that our new regional sorting facility in Savannah, Georgia is now fully operational. This expansion represents a significant milestone in our mission to bridge the gap between US auto part suppliers and the Ghanaian market.</p>
            
            <h3>What this means for you:</h3>
            <ul>
                <li><strong>Faster Sorting:</strong> Our specialized team can now process inbound parts from local OEMs 35% faster.</li>
                <li><strong>Enhanced Quality Audits:</strong> Every part now passes through a dual-verification stage where we check for physical damage and part number accuracy against your quote.</li>
                <li><strong>Direct Export Pipeline:</strong> The warehouse is situated just miles from the port, allowing for later cut-off times and smoother customs documentation.</li>
            </ul>

            <p>Our commitment remains unchanged: to provide Ghana with the definitive intercontinental supply chain bridge for authentic automotive parts.</p>
        `,
        date: "Feb 15, 2026",
        category: "Operations",
        slug: "new-georgia-logistics-center",
        author: "Hobort Logistics Team",
        readTime: "4 min read"
    },
    {
        title: "Extended Partnership with Georgia OEM Parts Network",
        content: `
            <p>Hobort Auto Express has successfully negotiated a tiered pricing agreement with three of Georgia's largest OEM distribution networks. This allows us to pass direct factory savings onto our customers in Ghana.</p>

            <h3>Key Benefits:</h3>
            <p>Through this partnership, we have secured priority allocation for high-demand components including Toyota transmission assemblies, Nissan sensor arrays, and Ford suspension kits. This ensures that even during global supply chain fluctuations, Hobort customers remain at the front of the line.</p>

            <blockquote>"This isn't just about prices; it's about sovereignty. By going direct to the source, we remove the middlemen who inflate costs and introduce counterfeit risks."</blockquote>

            <p>Effective immediately, all quotes for Japanese and American OEM parts will reflect a 5-8% reduction in base cost.</p>
        `,
        date: "Feb 10, 2026",
        category: "Pricing",
        slug: "georgia-oem-partnership",
        author: "Procurement Dept.",
        readTime: "3 min read"
    }
]

export default function UpdateDetailPage() {
    const { slug } = useParams()
    const update = UPDATES.find(u => u.slug === slug)

    if (!update) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Hero Header */}
            <section className="bg-slate-900 pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
                </div>

                <div className="container max-w-4xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Link
                            href="/updates"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mb-10 transition-colors group"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Newsroom
                        </Link>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/30">
                                {update.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                <Clock className="h-3 w-3" /> {update.readTime}
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-8">
                            {update.title}
                        </h1>

                        <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-white text-[11px] font-bold uppercase tracking-wider">{update.author}</p>
                                    <p className="text-slate-500 text-[10px] uppercase font-medium">{update.date}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Article Content */}
            <section className="container max-w-4xl mx-auto px-6 -mt-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 md:p-16"
                >
                    <article
                        className="prose prose-slate prose-lg max-w-none 
                            prose-headings:text-primary-blue prose-headings:font-bold prose-headings:tracking-tight
                            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
                            prose-strong:text-slate-900 prose-strong:font-black
                            prose-li:text-slate-600 prose-li:font-medium
                            prose-blockquote:border-l-4 prose-blockquote:border-primary-orange prose-blockquote:bg-slate-50 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-slate-700
                        "
                        dangerouslySetInnerHTML={{ __html: update.content }}
                    />

                    <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Helpful?</p>
                            <div className="flex gap-2">
                                <Button variant="outline" className="rounded-xl h-10 px-6 font-bold text-xs">Yes</Button>
                                <Button variant="outline" className="rounded-xl h-10 px-6 font-bold text-xs text-slate-400">No</Button>
                            </div>
                        </div>

                        <Button variant="ghost" className="rounded-xl font-bold text-xs uppercase tracking-widest gap-2 text-slate-400 hover:text-primary-blue transition-colors">
                            <Share2 className="h-4 w-4" /> Share Update
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* Newsletter Upsell */}
            <section className="container max-w-4xl mx-auto px-6 mt-20">
                <div className="bg-primary-blue rounded-[2.5rem] p-8 md:p-12 text-center text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <Newspaper className="h-10 w-10 text-primary-orange mx-auto" />
                        <h2 className="text-3xl font-bold tracking-tight">Never miss a supply update.</h2>
                        <p className="text-white/60 font-medium max-w-md mx-auto">Get notified about new OEM partnerships, warehouse arrivals, and shipping rate adjustments in Ghana.</p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 h-12 rounded-xl bg-white/10 border border-white/20 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-orange/50 transition-all"
                            />
                            <Button className="h-12 px-8 rounded-xl bg-primary-orange hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-900/20">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
