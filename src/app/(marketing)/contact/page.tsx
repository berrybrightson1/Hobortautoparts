"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Zap, Clock, ShieldCheck, MessageCircle } from "lucide-react"
import { SmartPhoneInput } from "@/components/ui/phone-input"
import { motion } from "framer-motion"

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        subject: "",
        message: ""
    })

    const handleWhatsAppRedirect = (e: React.FormEvent) => {
        e.preventDefault()

        const phoneNumber = "16784966882" // Updated US number
        const text = `*New Website Inquiry*\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Subject:* ${formData.subject}\n\n*Message:* ${formData.message}`

        const encodedText = encodeURIComponent(text)
        window.location.href = `https://wa.me/${phoneNumber}?text=${encodedText}`
    }

    return (
        <div className="flex flex-col pt-32 pb-20">
            <section className="container max-w-[1400px] mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl font-semibold text-primary-blue md:text-7xl tracking-tight leading-[1.1]">
                            Let's Talk <span className="text-primary-orange">Sourcing.</span>
                        </h1>
                        <p className="mt-8 text-xl text-slate-500 leading-relaxed mx-auto max-w-2xl">
                            Have questions about a specific part or our logistics process? Our team is ready to assist you via WhatsApp for lightning-fast responses.
                        </p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Left Section: Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="grid gap-6">
                            {[
                                {
                                    icon: MapPin,
                                    title: "USA Office",
                                    value: "815 Progress Ct Ste A, Lawrenceville, GA 30043",
                                    desc: "United States • Main Logistics Center",
                                    color: "text-primary-blue",
                                    bg: "bg-blue-50"
                                },
                                {
                                    icon: MessageCircle,
                                    title: "WhatsApp Support",
                                    value: "+1 (678) 496-6882",
                                    desc: "Global Logistics Support Line",
                                    color: "text-green-600",
                                    bg: "bg-green-50"
                                },
                                {
                                    icon: MapPin,
                                    title: "Ghana Contact",
                                    value: "0557300478 / 0501700653",
                                    desc: "JWVQ+9WR, Sakumono • Pickup Center",
                                    color: "text-primary-orange",
                                    bg: "bg-orange-50"
                                },
                                {
                                    icon: Mail,
                                    title: "Email",
                                    value: "info@hobortautopartsexpress.com",
                                    desc: "parts@hobortautopartsexpress.com",
                                    color: "text-primary-blue",
                                    bg: "bg-slate-50"
                                }
                            ].map((item, i) => (
                                <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group">
                                    <CardContent className="p-6 flex items-start gap-6">
                                        <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                                            <item.icon className={`h-6 w-6 ${item.color}`} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{item.title}</h3>
                                            <p className="text-lg font-semibold text-primary-blue">{item.value}</p>
                                            <p className="text-sm font-medium text-slate-500/70">{item.desc}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="p-10 rounded-2xl bg-primary-blue text-white relative overflow-hidden group shadow-2xl shadow-primary-blue/20">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <MessageCircle className="h-24 w-24" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                    <Zap className="h-3.3 w-3.3" /> Immediate Response
                                </div>
                                <h3 className="text-3xl font-semibold leading-tight">Connect with an Agent</h3>
                                <p className="text-blue-100/70 font-medium text-lg leading-relaxed">
                                    Our US-based sourcing agents are online and ready to verify your parts via WhatsApp.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Section: Form (WhatsApp Themed) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Card className="border-emerald-100 shadow-2xl shadow-primary-blue/5 rounded-2xl overflow-hidden">
                            <div className="bg-emerald-600 p-12 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <MessageCircle className="h-32 w-32 -mr-10 -mt-10" />
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-4xl font-semibold tracking-tight uppercase leading-none">Send a <span className="text-emerald-200">Message</span></h2>
                                    <p className="text-emerald-50/70 font-medium mt-3 text-lg">Direct WhatsApp Support • Agents Online</p>
                                </div>
                            </div>
                            <CardContent className="p-10 lg:p-12">
                                <form onSubmit={handleWhatsAppRedirect} className="space-y-8">
                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="ml-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Full Name</Label>
                                            <Input
                                                id="name"
                                                required
                                                placeholder="Berry Brightson"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="h-16 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-emerald-500/20 transition-all font-semibold placeholder:font-medium text-primary-blue"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="phone" className="ml-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Phone Number</Label>
                                            <SmartPhoneInput
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                                placeholder="Enter number..."
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="subject" className="ml-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Subject</Label>
                                        <Input
                                            id="subject"
                                            required
                                            placeholder="e.g. Bulk Order Inquiry"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-emerald-500/20 transition-all font-semibold placeholder:font-medium text-primary-blue"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="message" className="ml-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Message</Label>
                                        <Textarea
                                            id="message"
                                            required
                                            placeholder="How can we help you today?"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="min-h-[160px] rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-emerald-500/20 transition-all font-semibold p-6 resize-none placeholder:font-medium text-primary-blue"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-primary-orange hover:bg-orange-600 text-white font-bold h-20 rounded-2xl shadow-xl shadow-primary-orange/20 text-xl transition-all hover:scale-[1.01] active:scale-[0.99] group flex items-center justify-center gap-3">
                                        Send to WhatsApp <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            <section className="mt-32 py-20 bg-slate-50/50 border-y border-slate-100">
                <div className="container max-w-[1400px] mx-auto px-6 text-center">
                    <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-orange shadow-sm mb-2">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-semibold text-primary-blue tracking-tight">Secure & Professional</h2>
                        <p className="text-slate-500 font-medium">
                            Every enquiry is logged in our central CRM to ensure consistent follow-up and accountability. Your data is protected by industry-standard encryption.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
