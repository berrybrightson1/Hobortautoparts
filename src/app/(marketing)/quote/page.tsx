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
import { BrandedSelect } from "@/components/marketing/branded-select"
import { Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

// VIN Validation Helper
function validateVIN(vin: string) {
    if (!vin || vin.length !== 17) return false

    // Invalid characters in VIN: I, O, Q
    if (/[IOQ]/i.test(vin)) return false

    // Basic format: Must be alphanumeric
    if (!/^[A-HJ-NPR-Z0-9]+$/i.test(vin)) return false

    return true
}

// Common vehicle options for accuracy
const YEARS = Array.from({ length: 27 }, (_, i) => (2026 - i).toString())
const MAKES = ["Toyota", "Honda", "Mercedes-Benz", "BMW", "Ford", "Nissan", "Hyundai", "Kia", "Lexus", "Audi", "Land Rover", "Jeep", "Chevrolet", "Volkswagen"]
const COMMON_MODELS: Record<string, string[]> = {
    "Toyota": ["Camry", "Corolla", "RAV4", "Land Cruiser", "Hilux", "Vitz", "Highlander", "Avalon", "Tacoma", "Tundra"],
    "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Fit", "HR-V", "Odyssey", "Insight"],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "G-Class", "GLE", "GLC", "GLA", "GLS", "CLA"],
    "BMW": ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X6", "X7", "M3", "M5"],
    "Ford": ["F-150", "Explorer", "Escape", "Mustang", "Ranger", "Edge", "Focus", "Expedition"],
    "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder", "Patrol", "Navara", "Murano", "Titan"],
    "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Kona", "Ioniq"],
    "Kia": ["Sportage", "Sorento", "Telluride", "Rio", "Optima", "Stinger", "Soul"],
}
const COMMON_ENGINES = ["2.0L I4", "2.4L I4", "2.5L I4", "3.0L V6", "3.5L V6", "4.0L V8", "4.4L V8 Turbo", "Hybrid", "Electric"]
const COMMON_TRIMS = ["Base", "Standard", "Premium", "Luxury", "Sport", "LE", "XLE", "SE", "XSE", "Limited", "Platinum", "AMG Line", "M Sport"]

export default function QuotePage() {
    const { user, profile, loading: authLoading } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [step, setStep] = useState(1)
    const [vinLoading, setVinLoading] = useState(false)

    // Form state (minimal for demo)
    const [formData, setFormData] = useState({
        vin: "",
        year: "",
        make: "",
        model: "",
        submodel: "",
        engine: ""
    })
    const [vinError, setVinError] = useState<string | null>(null)
    const [isVehicleConfirmed, setIsVehicleConfirmed] = useState(false)

    const isStep1Valid = Boolean(formData.vin && formData.year && formData.make && formData.model && formData.submodel && formData.engine)

    // VIN detection logic
    useEffect(() => {
        const decodeVin = async () => {
            if (formData.vin.length === 17) {
                if (!validateVIN(formData.vin)) {
                    setVinError("Invalid VIN format. Letters I, O, and Q are not allowed.")
                    return
                }

                setVinError(null)
                setVinLoading(true)
                try {
                    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${formData.vin}?format=json`)
                    const data = await response.json()
                    const results = data.Results

                    const rawYear = results.find((r: any) => r.Variable === "Model Year")?.Value
                    const rawMake = results.find((r: any) => r.Variable === "Make")?.Value
                    const rawModel = results.find((r: any) => r.Variable === "Model")?.Value
                    const rawTrim = results.find((r: any) => r.Variable === "Trim")?.Value

                    if (!rawMake || !rawModel) {
                        setVinError("Vehicle not found. Please verify the VIN or enter details manually.")
                        setVinLoading(false)
                        return
                    }

                    // Normalize Make
                    const normalizedMake = MAKES.find(m => rawMake?.toUpperCase().includes(m.toUpperCase())) || rawMake

                    const engineDisp = results.find((r: any) => r.Variable === "Displacement (L)")?.Value
                    const engineCyl = results.find((r: any) => r.Variable === "Engine Number of Cylinders")?.Value
                    const engine = engineDisp ? `${engineDisp}L ${engineCyl ? engineCyl + 'cyl' : ''}` : results.find((r: any) => r.Variable === "Engine Model")?.Value

                    setFormData(prev => ({
                        ...prev,
                        year: rawYear || prev.year,
                        make: normalizedMake || prev.make,
                        model: rawModel || prev.model,
                        submodel: rawTrim || prev.submodel,
                        engine: engine || prev.engine
                    }))
                    setIsVehicleConfirmed(false) // Require re-confirmation
                } catch (error) {
                    console.error("VIN decoding failed:", error)
                    setVinError("Decoding failed. Please check your connection or enter manually.")
                } finally {
                    setVinLoading(false)
                }
            } else {
                setVinError(null)
            }
        }
        decodeVin()
    }, [formData.vin])

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        if (authLoading) return; // Wait for auth to resolve

        let currentUser = user;
        if (!currentUser) {
            // Double check session in case state hasn't updated
            const { data: { session } } = await supabase.auth.getSession();
            currentUser = session?.user || null;
        }

        if (!currentUser) {
            toast.error("Please sign in or create an account to submit a request.", {
                description: "This ensures you can track your request status."
            })
            setIsLoading(false)
            router.push('/login?redirect=/quote')
            return
        }

        try {
            const vehicle_info = `${formData.year} ${formData.make} ${formData.model} (${formData.submodel})`
            const { error } = await supabase
                .from('sourcing_requests')
                .insert({
                    user_id: currentUser.id,
                    agent_id: profile?.role === 'agent' ? currentUser.id : null,
                    vin: formData.vin,
                    part_name: (document.getElementById('parts') as HTMLTextAreaElement).value,
                    vehicle_info: vehicle_info,
                    status: 'pending'
                })

            if (error) throw error

            setIsSubmitted(true)
        } catch (error: any) {
            console.error("Error submitting sourcing request:", error)
            toast.error("Failed to submit request", {
                description: error.message
            })
        } finally {
            setIsLoading(false)
        }
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
                                <h1 className="text-4xl font-semibold text-primary-blue tracking-tighter">Request Received!</h1>
                                <p className="text-primary-blue/60 font-medium text-lg">Our agents are already looking for your parts.</p>
                            </div>
                        </div>

                        <CardContent className="p-10 space-y-8">
                            <div className="bg-white border-2 border-primary-orange/10 rounded-2xl p-6 relative overflow-hidden group hover:border-primary-orange/30 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Zap className="h-20 w-20 text-primary-orange" />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-orange/10 text-primary-orange text-[10px] font-medium uppercase tracking-widest">
                                        <ShieldCheck className="h-3 w-3" /> {user ? "Next Steps" : "Important Step"}
                                    </div>
                                    <h3 className="text-2xl font-semibold text-primary-blue leading-tight">
                                        {user ? (
                                            <>Track this request in your <span className="text-primary-orange">Dashboard</span> profile.</>
                                        ) : (
                                            <>Create an account to <span className="text-primary-orange">track your order</span> and save this request.</>
                                        )}
                                    </h3>
                                    <p className="text-primary-blue/70 font-medium">
                                        {user
                                            ? "You will receive notifications as soon as an agent updates your quote status."
                                            : "Join over 5,000 auto professionals getting live updates on their sourcing requests."
                                        }
                                    </p>
                                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                        <Link href={user ? "/portal" : "/signup"} className="flex-1 w-full">
                                            <Button className="w-full bg-primary-orange hover:bg-orange-600 text-white font-semibold h-14 rounded-xl shadow-lg shadow-primary-orange/20 text-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                                {user ? "Go to Dashboard" : "Create Account"} <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                        <Link href="/" className="flex-1 w-full">
                                            <Button variant="outline" className="w-full border-primary-blue/10 text-primary-blue/60 hover:text-primary-blue hover:bg-primary-blue/5 font-medium h-14 rounded-xl">
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
                                        <span className="text-[10px] font-medium text-primary-blue/40 uppercase tracking-tighter leading-none">{item.label}</span>
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
        <div className="min-h-screen bg-white flex flex-col items-center justify-start p-4 pt-20 pb-10 overflow-y-auto">
            <div className="w-full max-w-2xl animate-in fade-in duration-500">
                <div className="text-center mb-10 md:mb-12 space-y-2 relative px-4">
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/" className="group p-2 rounded-full hover:bg-primary-blue/5 transition-all outline-none">
                            <ArrowLeft className="h-6 w-6 text-primary-blue/30 group-hover:text-primary-blue group-hover:-translate-x-1 transition-all" />
                        </Link>
                        <h1 className="text-2xl md:text-4xl font-semibold text-primary-blue tracking-tighter">New Sourcing Request</h1>
                    </div>
                    <p className="text-primary-blue/60 font-medium text-sm md:text-base">Get a premium price estimate in record time.</p>
                </div>

                <Card className="border-primary-blue/10 shadow-2xl shadow-primary-blue/5 overflow-hidden rounded-3xl relative mx-auto w-full">
                    {/* Progress Indicator */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-blue/5 flex">
                        <div
                            className="h-full bg-primary-orange transition-all duration-500 ease-out"
                            style={{ width: `${(step / 2) * 100}%` }}
                        />
                    </div>

                    <CardHeader className="bg-primary-blue/5 border-b border-primary-blue/5 pb-6 pt-10 px-6 md:px-10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-semibold text-primary-orange uppercase tracking-[0.2em]">Step {step} of 2</span>
                            <span className="text-[10px] font-semibold text-primary-blue/40 uppercase tracking-[0.2em]">{step === 1 ? "Vehicle Details" : "Parts Specification"}</span>
                        </div>
                        <div className="flex items-center gap-4 md:gap-5">
                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary-blue text-white flex items-center justify-center shadow-xl shadow-primary-blue/20 shrink-0">
                                {step === 1 ? <Car className="h-6 w-6 md:h-7 md:w-7" /> : <Package className="h-6 w-6 md:h-7 md:w-7" />}
                            </div>
                            <div>
                                <CardTitle className="text-xl md:text-2xl font-semibold text-primary-blue tracking-tight">
                                    {step === 1 ? "Vehicle Details" : "Parts Specification"}
                                </CardTitle>
                                <CardDescription className="text-primary-blue/60 font-medium text-xs md:text-sm">
                                    {step === 1 ? "Every detail counts for an accurate quote." : "List exactly what you need."}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-5 md:p-10">
                        <form onSubmit={onSubmit} className="space-y-8">
                            {step === 1 ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2.5 relative">
                                                <Label htmlFor="vin" className="ml-1 text-[10px] font-medium text-primary-blue/80 uppercase tracking-widest leading-none mb-1">VIN Number</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="vin"
                                                        placeholder="17-CHARACTER VIN"
                                                        className={cn(
                                                            "h-14 pr-12 rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-mono uppercase font-semibold placeholder:normal-case placeholder:font-medium text-sm md:text-base",
                                                            vinError && "border-red-500 bg-red-50"
                                                        )}
                                                        required
                                                        maxLength={17}
                                                        value={formData.vin}
                                                        onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                                                    />
                                                    {vinLoading && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                            <div className="h-5 w-5 border-2 border-primary-orange/30 border-t-primary-orange rounded-full animate-spin" />
                                                        </div>
                                                    )}
                                                    {vinError && !vinLoading && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                                                            <AlertCircle className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                {vinError && (
                                                    <p className="text-[10px] text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">{vinError}</p>
                                                )}
                                            </div>
                                            <BrandedSelect
                                                label="Build Year"
                                                value={formData.year}
                                                options={YEARS}
                                                onChange={(val) => setFormData({ ...formData, year: val })}
                                                placeholder="Select Year"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <BrandedSelect
                                                label="Brand / Make"
                                                value={formData.make}
                                                options={MAKES}
                                                onChange={(val) => setFormData({ ...formData, make: val, model: "" })}
                                                placeholder="Select Brand"
                                            />
                                            <BrandedSelect
                                                label="Series / Model"
                                                value={formData.model}
                                                options={formData.make ? (COMMON_MODELS[formData.make] || ["Other"]) : []}
                                                onChange={(val) => setFormData({ ...formData, model: val })}
                                                placeholder={formData.make ? "Select Model" : "Select Brand First"}
                                                disabled={!formData.make}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <BrandedSelect
                                                label="Sub-Model / Trim"
                                                value={formData.submodel}
                                                options={COMMON_TRIMS}
                                                onChange={(val) => setFormData({ ...formData, submodel: val })}
                                                placeholder="Select Trim"
                                            />
                                            <BrandedSelect
                                                label="Engine Configuration"
                                                value={formData.engine}
                                                options={COMMON_ENGINES}
                                                onChange={(val) => setFormData({ ...formData, engine: val })}
                                                placeholder="Select Engine"
                                            />
                                        </div>
                                    </div>

                                    {/* Vehicle Profile Confirmation Card */}
                                    {isStep1Valid && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="bg-primary-blue/5 rounded-2xl p-4 md:p-6 border border-primary-blue/10 overflow-hidden"
                                        >
                                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
                                                    <ShieldCheck className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-blue/40 mb-1">Identified Vehicle Profile</h4>
                                                    <p className="text-base md:text-lg font-bold text-primary-blue leading-tight mb-4 break-words">
                                                        {formData.year} {formData.make} {formData.model}
                                                        <span className="block text-xs md:text-sm font-medium text-primary-blue/60 mt-1">{formData.submodel} • {formData.engine}</span>
                                                    </p>

                                                    {!isVehicleConfirmed ? (
                                                        <Button
                                                            type="button"
                                                            variant="orange"
                                                            className="h-10 px-6 rounded-xl text-xs font-bold w-full sm:w-auto"
                                                            onClick={() => setIsVehicleConfirmed(true)}
                                                        >
                                                            Yes, This is My Vehicle
                                                        </Button>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-500/5 py-2 px-3 rounded-lg border border-emerald-500/10 w-full sm:w-auto">
                                                            <CheckCircle2 className="h-4 w-4" /> Vehicle Verified
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <Button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        disabled={!isStep1Valid || !isVehicleConfirmed}
                                        className="w-full bg-primary-blue hover:bg-hobort-blue-dark text-white font-semibold h-16 rounded-2xl shadow-2xl shadow-primary-blue/20 text-lg transition-all hover:scale-[1.01] active:scale-[0.99] group disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isVehicleConfirmed ? "Continue to Parts" : "Please Confirm Vehicle Details"} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2.5">
                                        <Label htmlFor="parts" className="ml-1 text-[10px] font-medium text-primary-blue/80 uppercase tracking-widest">Detailed Description</Label>
                                        <Textarea
                                            id="parts"
                                            placeholder="e.g. Front ceramic brake pads, Carbon fiber mirror caps, etc."
                                            className="min-h-[180px] rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-medium p-5 resize-none placeholder:font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                            className="h-16 px-8 rounded-2xl border-primary-blue/10 text-primary-blue font-semibold hover:bg-primary-blue/5 order-2 sm:order-1"
                                        >
                                            <ArrowLeft className="mr-2 h-5 w-5" /> Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 bg-primary-blue hover:bg-hobort-blue-dark text-white font-semibold h-16 rounded-2xl shadow-2xl shadow-primary-blue/20 text-lg transition-all hover:scale-[1.01] active:scale-[0.99] order-1 sm:order-2"
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
                        <p className="text-[10px] font-semibold text-primary-blue/30 uppercase tracking-[0.2em]">
                            Professional Sourcing Network • Security Guaranteed
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

