"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Car, Package, CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function QuotePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [step, setStep] = useState(1)

    // Form state (minimal for demo)
    const [formData, setFormData] = useState({
        year: "",
        make: "",
        model: ""
    })

    const isStep1Valid = formData.year && formData.make && formData.model

    // Auto-advance logic
    useEffect(() => {
        if (step === 1 && isStep1Valid) {
            const timer = setTimeout(() => {
                setStep(2)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [isStep1Valid, step])

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            setIsSubmitted(true)
        }, 1500)
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-500">
                    <Card className="border-primary-blue/10 shadow-2xl shadow-primary-blue/5 overflow-hidden">
                        <div className="bg-primary-blue/5 p-12 text-center space-y-6">
                            <div className="inline-flex h-20 w-20 rounded-full bg-white text-primary-orange items-center justify-center shadow-xl shadow-primary-orange/20 animate-bounce">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black text-primary-blue tracking-tighter">Request Received!</h1>
                                <p className="text-primary-blue/60 font-bold text-lg">Our agents are already looking for your parts.</p>
                            </div>
                        </div>

                        <CardContent className="p-10 space-y-8">
                            <div className="bg-white border-2 border-primary-orange/10 rounded-2xl p-6 relative overflow-hidden group hover:border-primary-orange/30 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Zap className="h-20 w-20 text-primary-orange" />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-orange/10 text-primary-orange text-[10px] font-black uppercase tracking-widest">
                                        <ShieldCheck className="h-3 w-3" /> Important Step
                                    </div>
                                    <h3 className="text-2xl font-black text-primary-blue leading-tight">
                                        Create an account to <span className="text-primary-orange">track your order</span> and save this request.
                                    </h3>
                                    <p className="text-primary-blue/70 font-bold">
                                        Join over 5,000 auto professionals getting live updates on their sourcing requests.
                                    </p>
                                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                        <Link href="/signup" className="flex-1">
                                            <Button className="w-full bg-primary-orange hover:bg-orange-600 text-white font-black h-14 rounded-xl shadow-lg shadow-primary-orange/20 text-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                                Create Account <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                        <Link href="/" className="flex-1">
                                            <Button variant="outline" className="w-full border-primary-blue/10 text-primary-blue/60 hover:text-primary-blue hover:bg-primary-blue/5 font-black h-14 rounded-xl">
                                                Back to Home
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: "Real-time Tracking", icon: Zap },
                                    { label: "Direct Support", icon: Car },
                                    { label: "Order History", icon: Package },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center text-center gap-2">
                                        <div className="h-10 w-10 rounded-full bg-primary-blue/5 flex items-center justify-center text-primary-blue">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[10px] font-black text-primary-blue/40 uppercase tracking-tighter leading-none">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl animate-in fade-in duration-500">
                <div className="text-center mb-12 space-y-2 relative">
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/" className="group p-2 rounded-full hover:bg-primary-blue/5 transition-all outline-none">
                            <ArrowLeft className="h-6 w-6 text-primary-blue/30 group-hover:text-primary-blue group-hover:-translate-x-1 transition-all" />
                        </Link>
                        <h1 className="text-4xl font-black text-primary-blue tracking-tighter">New Sourcing Request</h1>
                    </div>
                    <p className="text-primary-blue/60 font-bold">Get a premium price estimate in record time.</p>
                </div>

                <Card className="border-primary-blue/10 shadow-2xl shadow-primary-blue/5 overflow-hidden rounded-3xl relative">
                    {/* Progress Indicator */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-blue/5 flex">
                        <div
                            className="h-full bg-primary-orange transition-all duration-500 ease-out"
                            style={{ width: `${(step / 2) * 100}%` }}
                        />
                    </div>

                    <CardHeader className="bg-primary-blue/5 border-b border-primary-blue/5 pb-8 pt-12 px-10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-primary-orange uppercase tracking-[0.2em]">Step {step} of 2</span>
                            <span className="text-[10px] font-black text-primary-blue/40 uppercase tracking-[0.2em]">{step === 1 ? "Vehicle Details" : "Parts Specification"}</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-primary-blue text-white flex items-center justify-center shadow-xl shadow-primary-blue/20">
                                {step === 1 ? <Car className="h-7 w-7" /> : <Package className="h-7 w-7" />}
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-primary-blue tracking-tight">
                                    {step === 1 ? "Vehicle Details" : "Parts Specification"}
                                </CardTitle>
                                <CardDescription className="text-primary-blue/60 font-bold text-sm">
                                    {step === 1 ? "Every detail counts for an accurate quote." : "List exactly what you need."}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-10">
                        <form onSubmit={onSubmit} className="space-y-8">
                            {step === 1 ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <Label htmlFor="vin" className="ml-1 text-[10px] font-black text-primary-blue/80 uppercase tracking-widest">VIN (Optional)</Label>
                                                <Input id="vin" placeholder="17-CHARACTER VIN" className="h-14 rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-mono uppercase font-black placeholder:normal-case placeholder:font-bold" />
                                            </div>
                                            <div className="space-y-2.5">
                                                <Label htmlFor="year" className="ml-1 text-[10px] font-black text-primary-blue/80 uppercase tracking-widest">Build Year</Label>
                                                <Input
                                                    id="year"
                                                    placeholder="e.g. 2024"
                                                    required
                                                    value={formData.year}
                                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                                    className="h-14 rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-black placeholder:font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <Label htmlFor="make" className="ml-1 text-[10px] font-black text-primary-blue/80 uppercase tracking-widest">Brand / Make</Label>
                                                <Input
                                                    id="make"
                                                    placeholder="e.g. Mercedes-Benz"
                                                    required
                                                    value={formData.make}
                                                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                                    className="h-14 rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-black placeholder:font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <Label htmlFor="model" className="ml-1 text-[10px] font-black text-primary-blue/80 uppercase tracking-widest">Series / Model</Label>
                                                <Input
                                                    id="model"
                                                    placeholder="e.g. G-Class"
                                                    required
                                                    value={formData.model}
                                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                                    className="h-14 rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-black placeholder:font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        disabled={!isStep1Valid}
                                        className="w-full bg-primary-blue hover:bg-hobort-blue-dark text-white font-black h-16 rounded-2xl shadow-2xl shadow-primary-blue/20 text-lg transition-all hover:scale-[1.01] active:scale-[0.99] group"
                                    >
                                        {isStep1Valid ? "Switching to Parts..." : "Continue to Parts"} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2.5">
                                        <Label htmlFor="parts" className="ml-1 text-[10px] font-black text-primary-blue/80 uppercase tracking-widest">Detailed Description</Label>
                                        <Textarea
                                            id="parts"
                                            placeholder="e.g. Front ceramic brake pads, Carbon fiber mirror caps, etc."
                                            className="min-h-[180px] rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-black p-5 resize-none placeholder:font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                            className="h-16 px-8 rounded-2xl border-primary-blue/10 text-primary-blue font-black hover:bg-primary-blue/5"
                                        >
                                            <ArrowLeft className="mr-2 h-5 w-5" /> Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 bg-primary-blue hover:bg-hobort-blue-dark text-white font-black h-16 rounded-2xl shadow-2xl shadow-primary-blue/20 text-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                            ) : (
                                                "Submit Sourcing Request"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                    <CardFooter className="bg-primary-blue/5 p-6 flex justify-center border-t border-primary-blue/5">
                        <p className="text-[10px] font-black text-primary-blue/30 uppercase tracking-[0.2em]">
                            Professional Sourcing Network • Security Guaranteed
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
