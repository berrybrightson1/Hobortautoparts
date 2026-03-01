"use client"

import * as React from "react"
import { MessageSquare, X, Minus, ChevronRight, HelpCircle, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

// Hardcoded FAQ Dictionary
// Expanded Hardcoded FAQ Dictionary
const FAQ_CATEGORIES = [
    {
        id: "general",
        title: "General & Guest Info",
        questions: [
            { q: "What is Hobort Auto Parts Express?", a: "We are a premium B2B and B2C integrated auto parts sourcing platform connecting you directly to US-based inventory." },
            { q: "Do I need an account to buy?", a: "Guests can browse our guides, but an account is required to request tailored quotes and track shipments securely." },
            { q: "How do I create an account?", a: "Click 'Get Started' in the top right. You can register as a direct Customer or apply to be a Partner Agent." },
            { q: "Are the parts inspected?", a: "Yes, our team runs strict quality control checks before parts are prepped for freight." }
        ]
    },
    {
        id: "sourcing",
        title: "Customers & Sourcing",
        questions: [
            { q: "How long does a quote take?", a: "Quotes are typically generated within 2-4 hours during business days." },
            { q: "Do you source used parts?", a: "Yes, we source both OEM New and certified salvaged parts based on your preference." },
            { q: "Why do you need my VIN?", a: "Your 17-digit VIN ensures 100% accurate fitment for your specific vehicle trim and engine." },
            { q: "Can I request multiple parts at once?", a: "Absolutely. You can list all needed components in a single Sourcing Request." }
        ]
    },
    {
        id: "shipping",
        title: "Shipping & Logistics",
        questions: [
            { q: "How long is shipping to Ghana?", a: "Air freight takes 7-10 days. Ocean freight takes 4-6 weeks to Tema Port." },
            { q: "How do I track my order?", a: "Use the 8-character Reference ID provided in your dashboard on our Tracking page." },
            { q: "Are customs included?", a: "Customs clearing fees at Tema Port are handled by HAPE but billed separately upon arrival." }
        ]
    },
    {
        id: "agent",
        title: "Agent Program",
        questions: [
            { q: "How do I become an agent?", a: "Register an account, fill out the Agent Application, and wait for an Admin to review your logistics background." },
            { q: "What happens after approval?", a: "You will complete our mandatory Agent Bootcamp to learn our guidelines before your dashboard unlocks." },
            { q: "What is the commission rate?", a: "Agents earn a competitive percentage on every successful part sourced through their account." },
            { q: "Can agents order for clients?", a: "Yes, approved agents have a dedicated 'Create Proxy Order' tool within their portal." }
        ]
    }
]

export function ChatWidget() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isMinimized, setIsMinimized] = React.useState(false)
    const [activeCategory, setActiveCategory] = React.useState<string | null>(null)
    const { profile } = useAuth()

    // Hide quick help widget entirely for admins
    if (profile?.role === 'admin') {
        return null
    }

    const currentCategory = FAQ_CATEGORIES.find(c => c.id === activeCategory)

    const TriggerButton = () => (
        <motion.div
            initial={{ scale: 0, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            className="fixed bottom-6 right-6 flex items-center gap-3 z-[50]"
        >
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 hidden md:block"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-orange">Quick Help</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="h-14 w-14 bg-primary-orange text-white rounded-full shadow-xl shadow-orange-900/20 flex items-center justify-center transition-transform"
                onClick={() => setIsOpen(true)}
                aria-label="Open support chat"
            >
                <HelpCircle className="h-6 w-6" />
            </motion.button>
        </motion.div>
    )

    return (
        <React.Fragment>
            {!isOpen && <TriggerButton />}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? 'auto' : '500px'
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={cn(
                            "fixed bottom-6 right-6 w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[50] flex flex-col",
                            isMinimized ? "h-auto" : "h-[500px]"
                        )}
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary-blue text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                {activeCategory && !isMinimized && (
                                    <button
                                        onClick={() => setActiveCategory(null)}
                                        className="hover:bg-white/10 p-1 rounded-full mr-1 transition-colors"
                                        title="Back to Categories"
                                    >
                                        <ChevronRight className="h-4 w-4 rotate-180" />
                                    </button>
                                )}
                                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="font-bold text-sm tracking-wide">
                                    Hobort Assistant
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    title={isMinimized ? "Maximize Assistant" : "Minimize Assistant"}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Close Assistant"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <div className="flex-1 overflow-y-auto bg-slate-50 relative scroll-smooth">
                                <AnimatePresence mode="wait">
                                    {!activeCategory ? (
                                        <motion.div
                                            key="categories"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="p-4 space-y-4"
                                        >
                                            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm font-medium text-slate-700 leading-relaxed mb-6">
                                                Hi! I'm the Hobort automated assistant. How can I help you today?
                                            </div>

                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Select a Topic</p>
                                            <div className="space-y-2">
                                                {FAQ_CATEGORIES.map(category => (
                                                    <button
                                                        key={category.id}
                                                        onClick={() => setActiveCategory(category.id)}
                                                        className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-orange/30 hover:shadow-md transition-all text-left flex items-center justify-between group"
                                                    >
                                                        <span className="font-bold text-slate-800 text-sm">{category.title}</span>
                                                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary-orange transition-colors" />
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="questions"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="p-4 space-y-6"
                                        >
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">
                                                {currentCategory?.title}
                                            </p>
                                            {currentCategory?.questions.map((q, idx) => (
                                                <div key={idx} className="space-y-3">
                                                    {/* Fake Question Bubble */}
                                                    <div className="ml-auto w-[85%] bg-slate-200 text-slate-700 p-3 rounded-2xl rounded-tr-none text-xs font-semibold shadow-sm">
                                                        {q.q}
                                                    </div>
                                                    {/* Answer Bubble */}
                                                    <div className="mr-auto w-[90%] bg-white border border-slate-100 text-slate-600 p-4 rounded-2xl rounded-tl-none text-xs font-medium leading-relaxed shadow-sm">
                                                        {q.a}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-6 border-t border-slate-200 text-center">
                                                <p className="text-xs text-slate-500 mb-3">Still need help?</p>
                                                <Link href="/contact" className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
                                                    Contact Support
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </React.Fragment>
    )
}
