"use client"

import { Badge } from "@/components/ui/badge"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "framer-motion"

const faqs = [
    {
        question: "How do you guarantee part compatibility?",
        answer: "Every request is cross-referenced using our advanced VIN decoding system. Our technical team manually verifies each component against the manufacturer's exact specifications before sourcing."
    },
    {
        question: "What is the typical shipping timeline?",
        answer: "Shipping times vary depending on the sourcing location, but most U.S. inventory reaches our global hubs within 5-7 business days. We provide real-time tracking for every step of the journey."
    },
    {
        question: "Can I track my request without an account?",
        answer: "Yes. Every request is assigned a unique tracking ID. You can enter this ID on our Homepage or Tracking Hub to view the live status of your order without needing to sign in."
    },
    {
        question: "How do I edit a request after it's submitted?",
        answer: "If your request is still in 'Pending' status, you can edit it directly from your Customer Portal. Once an agent provides a quote, you can use the live chat to request specific modifications."
    },
    {
        question: "Do you handle customs documentation?",
        answer: "Yes. Our logistics team prepares all necessary export documents and customs declarations to ensure a seamless entry into your country, minimizing delays and unexpected costs."
    },
    {
        question: "What happens if a part is damaged during transit?",
        answer: "All shipments are insured. If a part arrives damaged, our support team will initiate a priority replacement or refund process immediately upon verification of the shipping claim."
    },
    {
        question: "Are the parts genuine OEM?",
        answer: "We offer both authentic OEM (Original Equipment Manufacturer) and certified high-grade aftermarket components. Every part listing clearly specifies its origin and certification status."
    },
    {
        question: "Does the initial quote include shipping to Ghana?",
        answer: "No — the initial quote we provide covers the part cost and US-side handling only. Shipping costs from the USA to Ghana (or your destination country) are calculated separately after the part is confirmed and packaged, as they depend on weight, dimensions, and your exact delivery address. Our team will provide a full landed-cost breakdown before you confirm your order."
    }
]

export function FAQSection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Soft decorative background element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-blue/5 rounded-full -mr-64 -mt-32 blur-3xl opacity-50" />

            <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Badge className="mb-6 bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 border-none px-4 py-1 text-xs font-bold uppercase tracking-widest">
                                Help Center
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-primary-blue mb-8 font-display">
                                Questions <span className="text-primary-orange">&</span> Answers
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed font-medium mb-10 max-w-md">
                                Everything you need to know about our global sourcing and logistics process. Can&apos;t find what you&apos;re looking for? Reach out to our 24/7 support.
                            </p>

                            <div className="flex items-center gap-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Response Time</span>
                                    <span className="text-sm font-bold text-primary-blue leading-tight uppercase tracking-tight">Under 15 Minutes</span>
                                </div>
                                <div className="w-px h-10 bg-slate-100" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Availability</span>
                                    <span className="text-sm font-bold text-primary-blue leading-tight uppercase tracking-tight">24/7 Global Support</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {faqs.map((faq, i) => (
                                    <AccordionItem
                                        key={i}
                                        value={`item-${i}`}
                                        className="border border-slate-100 rounded-2xl px-8 bg-slate-50/50 hover:bg-white hover:border-primary-orange/20 hover:shadow-xl hover:shadow-primary-blue/5 transition-all duration-300"
                                    >
                                        <AccordionTrigger className="text-[13px] font-bold uppercase tracking-widest text-primary-blue hover:no-underline py-6 text-left">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm text-slate-500 font-medium leading-relaxed pb-6 lowercase first-letter:uppercase">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
