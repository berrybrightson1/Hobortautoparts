"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Zap, Clock, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

export default function ContactPage() {
    return (
        <div className="flex flex-col pt-32 pb-20">
            <section className="container mx-auto px-4 md:px-8">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl font-black text-primary-blue md:text-7xl tracking-tight leading-[1.1]">
                            Let's Talk <span className="text-primary-orange">Sourcing.</span>
                        </h1>
                        <p className="mt-8 text-xl text-slate-500 leading-relaxed mx-auto max-w-2xl">
                            Have questions about a specific part or our logistics process? Our team is ready to assist you in getting exactly what your vehicle needs.
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
                                    icon: Phone,
                                    title: "US Phone",
                                    value: "+1 404-543-4422",
                                    desc: "Logistics Support Line",
                                    color: "text-primary-orange",
                                    bg: "bg-orange-50"
                                },
                                {
                                    icon: MapPin,
                                    title: "Ghana Office",
                                    value: "JWVQ+9WR, Sakumono",
                                    desc: "Greater Accra • Pickup Center",
                                    color: "text-green-600",
                                    bg: "bg-green-50"
                                },
                                {
                                    icon: Mail,
                                    title: "Email",
                                    value: "Info@hobortautopartsexpress.com",
                                    desc: "Response within 2 hours",
                                    color: "text-primary-blue",
                                    bg: "bg-slate-50"
                                }
                            ].map((item, i) => (
                                <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden">
                                    <CardContent className="p-6 flex items-start gap-6">
                                        <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
                                            <item.icon className={`h-6 w-6 ${item.color}`} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.title}</h3>
                                            <p className="text-lg font-black text-primary-blue">{item.value}</p>
                                            <p className="text-sm font-medium text-slate-500">{item.desc}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-primary-blue text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="h-24 w-24" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                                    <Clock className="h-3 w-3" /> Priority Support
                                </div>
                                <h3 className="text-2xl font-black leading-tight">Emergency Part Request?</h3>
                                <p className="text-blue-100/70 font-medium">
                                    Existing customers with active Hub IDs get 24/7 priority access to our US sourcing agents.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Section: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Card className="border-primary-blue/10 shadow-2xl shadow-primary-blue/5 rounded-[3rem] overflow-hidden">
                            <div className="bg-primary-blue/5 p-10 border-b border-primary-blue/5">
                                <h2 className="text-3xl font-black text-primary-blue tracking-tight">Send a Message</h2>
                                <p className="text-primary-blue/60 font-medium mt-1">Our agents are standing by.</p>
                            </div>
                            <CardContent className="p-10">
                                <form className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <Label htmlFor="name" className="ml-1 text-[10px] font-black text-primary-blue/80 uppercase tracking-widest">Full Name</Label>
                                            <Input id="name" placeholder="John Doe" className="h-14 rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-black placeholder:font-bold" />
                                        </div>
                                        <div className="space-y-2.5">
                                            <Label htmlFor="phone" className="ml-1 text-[10px] font-black text-primary-blue/80 uppercase tracking-widest">Phone Number</Label>
                                            <Input id="phone" placeholder="+233..." className="h-14 rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-black placeholder:font-bold" />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label htmlFor="subject" className="ml-1 text-[10px] font-black text-primary-blue/80 uppercase tracking-widest">Subject</Label>
                                        <Input id="subject" placeholder="e.g. Bulk Order Inquiry" className="h-14 rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-black placeholder:font-bold" />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label htmlFor="message" className="ml-1 text-[10px] font-black text-primary-blue/80 uppercase tracking-widest">Message</Label>
                                        <Textarea id="message" placeholder="How can we help you today?" className="min-h-[150px] rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-black p-5 resize-none placeholder:font-bold" />
                                    </div>
                                    <Button className="w-full bg-primary-orange hover:bg-orange-600 text-white font-black h-16 rounded-2xl shadow-xl shadow-primary-orange/20 text-lg transition-all hover:scale-[1.01] active:scale-[0.99] group">
                                        Send Message <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            <section className="mt-32 py-20 bg-slate-50/50 border-y border-slate-100">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-orange shadow-sm mb-2">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-black text-primary-blue tracking-tight">Secure & Professional</h2>
                        <p className="text-slate-500 font-medium">
                            Every enquiry is logged in our central CRM to ensure consistent follow-up and accountability. Your data is protected by industry-standard encryption.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
