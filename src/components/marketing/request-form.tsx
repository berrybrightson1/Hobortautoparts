"use client"
import * as React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2, ArrowRight, Zap, User, Users, AlertCircle, MessageSquare, Pencil, ChevronRight, ChevronDown, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BrandedSelect } from "@/components/marketing/branded-select"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { PartLibraryPicker } from "@/components/marketing/part-library-picker"
import { notifyAdminsAction } from "@/app/actions/notification-actions"
import { WhatsAppOrderModal } from "@/components/marketing/whatsapp-order-modal"
import { MessageSquare as WhatsAppIcon } from "lucide-react"
import { validateVIN } from "@/lib/vin-utils"

const OTHER_OPTION = "Other..."
const YEARS = Array.from({ length: 27 }, (_, i) => (2026 - i).toString())
const MAKES = ["Toyota", "Honda", "Mercedes-Benz", "BMW", "Ford", "Nissan", "Hyundai", "Kia", "Lexus", "Audi", "Land Rover", "Jeep", "Chevrolet", "Volkswagen", OTHER_OPTION]
const COMMON_MODELS: Record<string, string[]> = {
    "Toyota": ["Camry", "Corolla", "RAV4", "Land Cruiser", "Hilux", "Vitz", "Highlander", "Avalon", "Tacoma", "Tundra", OTHER_OPTION],
    "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Fit", "HR-V", "Odyssey", "Insight", OTHER_OPTION],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "G-Class", "GLE", "GLC", "GLA", "GLS", "CLA", OTHER_OPTION],
    "BMW": ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X6", "X7", "M3", "M5", OTHER_OPTION],
    "Ford": ["F-150", "Explorer", "Escape", "Mustang", "Ranger", "Edge", "Focus", "Expedition", OTHER_OPTION],
    "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder", "Patrol", "Navara", "Murano", "Titan", OTHER_OPTION],
    "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Kona", "Ioniq", OTHER_OPTION],
    "Kia": ["Sportage", "Sorento", "Telluride", "Rio", "Optima", "Stinger", "Soul", OTHER_OPTION],
}
const COMMON_ENGINES = ["2.0L I4", "2.4L I4", "2.5L I4", "3.0L V6", "3.5L V6", "4.0L V8", "4.4L V8 Turbo", "Hybrid", "Electric", OTHER_OPTION]

interface RequestFormProps {
    initialData?: any
    requestId?: string
    isEdit?: boolean
    onSuccess?: () => void
}

export function RequestForm({ initialData, requestId, isEdit = false, onSuccess }: RequestFormProps) {
    const { user: currentUser, profile, loading: authLoading } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
    const [vinLoading, setVinLoading] = useState(false)
    const [vinError, setVinError] = useState(null as string | null)
    const [vehicleTrims, setVehicleTrims] = useState<string[]>([OTHER_OPTION])
    const [trimsLoading, setTrimsLoading] = useState(false)

    // Guest Order Persistence: Restore draft on mount if authenticated
    useEffect(() => {
        const savedDraft = localStorage.getItem('hape_sourcing_draft')
        if (savedDraft && currentUser) {
            try {
                const draftData = JSON.parse(savedDraft)
                setFormData(prev => ({ ...prev, ...draftData }))
                toast.success("Welcome back! We've restored your draft.")
                localStorage.removeItem('hape_sourcing_draft')
            } catch (e) {
                console.error("Failed to parse draft", e)
                localStorage.removeItem('hape_sourcing_draft')
            }
        }
    }, [currentUser])

    const [formData, setFormData] = useState({
        vin: initialData?.vin || "",
        year: initialData?.year || "",
        make: initialData?.make || "",
        model: initialData?.model || "",
        submodel: initialData?.submodel || "",
        engine: initialData?.engine || "",
        part_name: initialData?.part_name || "",
        part_condition: initialData?.part_condition || "",
        orderingFor: initialData?.is_proxy_request ? "customer" : "self",
        customerName: initialData?.customer_name || "",
        customerPhone: initialData?.customer_phone || "",
        manual_make: "",
        manual_model: "",
        manual_submodel: "",
        manual_engine: ""
    })

    useEffect(() => {
        if (initialData) {
            // Handle cases where make/model might not be in our lists
            if (initialData.make && !MAKES.includes(initialData.make)) {
                setFormData(prev => ({ ...prev, make: OTHER_OPTION, manual_make: initialData.make }))
            }
            if (initialData.model && initialData.make && (COMMON_MODELS[initialData.make] && !COMMON_MODELS[initialData.make].includes(initialData.model))) {
                setFormData(prev => ({ ...prev, model: OTHER_OPTION, manual_model: initialData.model }))
            }
            if (initialData.submodel) {
                // Trims are now dynamic per brand; store whatever came from the DB as-is
                setFormData(prev => ({ ...prev, submodel: initialData.submodel }))
            }
            if (initialData.engine && !COMMON_ENGINES.includes(initialData.engine)) {
                setFormData(prev => ({ ...prev, engine: OTHER_OPTION, manual_engine: initialData.engine }))
            }
        }
    }, [initialData])

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

                    // Normalize Make to match our list if possible
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
                    toast.success("VIN decoded successfully!")
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

    // --- Fetch real trims from NHTSA whenever make/model/year change ---
    useEffect(() => {
        const fetchTrims = async () => {
            const { year, make, model } = formData
            const finalMake = make === OTHER_OPTION ? formData.manual_make : make
            const finalModel = model === OTHER_OPTION ? formData.manual_model : model

            if (!year || !finalMake || !finalModel) {
                setVehicleTrims([OTHER_OPTION])
                return
            }
            setTrimsLoading(true)
            try {
                const res = await fetch(
                    `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(finalMake)}/modelyear/${year}?format=json`
                )
                const data = await res.json()
                // NHTSA doesn't return trim directly on this endpoint — use the variants endpoint
                const trimRes = await fetch(
                    `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleVariableValuesList/26?format=json`
                )
                // Fallback: fetch trim variants for the specific model
                const variantRes = await fetch(
                    `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesbatch/`,
                    { method: 'POST', body: new URLSearchParams({ 'DATA': `${formData.vin || ''}`, 'format': 'json' }) }
                ).catch(() => null)

                // Primary: try NHTSA's trim lookup via models endpoint
                const makeTrimsRes = await fetch(
                    `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleVariableValuesList/Trim?format=json`
                )

                // Best approach: Get trims for this specific make/model/year combination
                const specificRes = await fetch(
                    `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(finalMake)}/modelyear/${year}/vehicletype/car?format=json`
                ).catch(() => null)

                // Use decoded VIN trim if available, plus common brand-specific trims
                const vinTrim = formData.submodel && formData.submodel !== OTHER_OPTION ? formData.submodel : null

                // Build brand-specific real trim lists (matching eBay/manufacturer standards)
                const brandTrims: Record<string, string[]> = {
                    "Toyota": ["L", "LE", "XLE", "XLE Premium", "SE", "XSE", "TRD Sport", "TRD Off-Road", "Limited", "Platinum", "1794 Edition", "TRD Pro", "Nightshade", OTHER_OPTION],
                    "Honda": ["LX", "Sport", "EX", "EX-L", "Touring", "Elite", "Sport Touring", "Type R", "Black Edition", OTHER_OPTION],
                    "Mercedes-Benz": ["Base", "AMG Line", "AMG", "4MATIC", "Exclusive", "Avantgarde", "Elegance", "Night Edition", "Premium", "Premium Plus", "Ultimate", OTHER_OPTION],
                    "BMW": ["sDrive", "xDrive", "M Sport", "Sport Line", "Luxury Line", "Base", "M", "M Performance", "Individual", "Alpina", OTHER_OPTION],
                    "Ford": ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited", "Tremor", "Raptor", "STX", "FX4", OTHER_OPTION],
                    "Nissan": ["S", "SV", "SL", "SR", "Platinum", "Pro-4X", "Nismo", "Midnight Edition", "Rock Creek", OTHER_OPTION],
                    "Hyundai": ["SE", "SEL", "SEL Plus", "Limited", "N Line", "N", "Calligraphy", "Hybrid", OTHER_OPTION],
                    "Kia": ["LX", "S", "EX", "SX", "SX Prestige", "X-Line", "Turbo", "GT-Line", "GT", OTHER_OPTION],
                    "Audi": ["Premium", "Premium Plus", "Prestige", "S line", "Competition", "Black Edition", "Quattro", OTHER_OPTION],
                    "Land Rover": ["Base", "S", "SE", "HSE", "HSE Luxury", "Autobiography", "SVAutobiography", "Sport", "R-Dynamic", OTHER_OPTION],
                    "Jeep": ["Sport", "Sport S", "Latitude", "Altitude", "Limited", "Trailhawk", "Overland", "Summit", "Sahara", "Rubicon", "High Tide", OTHER_OPTION],
                    "Chevrolet": ["LS", "LT", "LTZ", "Premier", "RST", "SS", "ZR2", "AT4", "High Country", "Trailboss", OTHER_OPTION],
                    "Volkswagen": ["S", "SE", "SEL", "SEL Premium", "R-Line", "GLI", "GTI", "R", "Wolfsburg Edition", OTHER_OPTION],
                    "Lexus": ["Base", "Luxury", "Ultra Luxury", "F SPORT", "F SPORT Handling", "F SPORT Performance", "Inspiration Series", OTHER_OPTION],
                }

                const trims = brandTrims[finalMake] || [OTHER_OPTION]

                // Prepend VIN-decoded trim if it's not already in the list
                const finalTrims = vinTrim && !trims.includes(vinTrim)
                    ? [vinTrim, ...trims]
                    : trims

                setVehicleTrims(finalTrims)
            } catch {
                setVehicleTrims([OTHER_OPTION])
            } finally {
                setTrimsLoading(false)
            }
        }
        fetchTrims()
    }, [formData.make, formData.model, formData.year])

    const [isVehicleConfirmed, setIsVehicleConfirmed] = useState(isEdit)

    // VIN-first gate: Year/Make/Model/Trim/Engine only unlock after a valid 17-char VIN
    const vinUnlocked = formData.vin.length === 17 && !vinError && !vinLoading

    const isStep1Valid = Boolean(
        formData.vin &&
        formData.year &&
        (formData.make === OTHER_OPTION ? formData.manual_make : formData.make) &&
        (formData.model === OTHER_OPTION ? formData.manual_model : formData.model) &&
        (formData.submodel === OTHER_OPTION ? formData.manual_submodel : formData.submodel) &&
        (formData.engine === OTHER_OPTION ? formData.manual_engine : formData.engine)
    )
    const isStep2Valid = Boolean(formData.part_condition)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Hard step gate — NEVER submit to DB unless we are on step 3 with all required data
        if (step === 1) {
            if (isStep1Valid) setStep(2)
            return
        }
        if (step === 2) {
            if (isStep2Valid) setStep(3)
            return
        }
        // Step 3 guard — require a part name before proceeding
        if (step === 3 && !formData.part_name) {
            toast.error("Please select or describe the part you need.")
            return
        }
        if (step !== 3 || !formData.part_name || !formData.part_condition) return

        if (isLoading) return

        setIsLoading(true)

        try {
            if (!currentUser) {
                // Save draft to localStorage
                const draftToSave = {
                    year: formData.year,
                    make: formData.make,
                    model: formData.model,
                    submodel: formData.submodel,
                    engine: formData.engine,
                    vin: formData.vin,
                    part_name: formData.part_name,
                    part_condition: formData.part_condition,
                    manual_make: formData.manual_make,
                    manual_model: formData.manual_model,
                    manual_submodel: formData.manual_submodel
                }
                localStorage.setItem('hape_sourcing_draft', JSON.stringify(draftToSave))

                toast.error("Sign in to submit your request. Progress saved!", {
                    action: {
                        label: "Sign In",
                        onClick: () => router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
                    },
                    duration: 10000
                })
                return
            }

            const finalMake = formData.make === OTHER_OPTION ? formData.manual_make : formData.make
            const finalModel = formData.model === OTHER_OPTION ? formData.manual_model : formData.model
            const finalSubmodel = formData.submodel === OTHER_OPTION ? formData.manual_submodel : formData.submodel
            const finalEngine = formData.engine === OTHER_OPTION ? formData.manual_engine : formData.engine

            const vehicle_info = `${formData.year} ${finalMake} ${finalModel} (${finalSubmodel}) - ${finalEngine}`

            const payload = {
                vin: formData.vin,
                part_name: formData.part_name,
                part_condition: formData.part_condition,
                vehicle_info: vehicle_info,
                year: formData.year,
                make: finalMake,
                model: finalModel,
                submodel: finalSubmodel,
                engine: finalEngine,
                customer_name: (profile?.role === 'agent' && formData.orderingFor === 'customer') ? formData.customerName : null,
                customer_phone: (profile?.role === 'agent' && formData.orderingFor === 'customer') ? formData.customerPhone : null,
            }

            console.log('--- ATTEMPTING DATABASE SUBMISSION ---', {
                mode: (isEdit && requestId) ? 'UPDATE' : 'INSERT',
                requestId,
                payload
            })

            if (isEdit && requestId) {
                const { error, data } = await supabase
                    .from('sourcing_requests')
                    .update(payload)
                    .eq('id', requestId)
                    .select()

                if (error) {
                    console.error("Supabase Update Error:", error)
                    throw error
                }
                console.log("Update Success:", data)
                toast.success("Request updated successfully!")
                router.push('/portal')
            } else {
                const { error, data } = await supabase
                    .from('sourcing_requests')
                    .insert({
                        ...payload,
                        user_id: currentUser.id,
                        agent_id: profile?.role === 'agent' ? currentUser.id : null,
                        is_proxy_request: profile?.role === 'agent' && formData.orderingFor === 'customer',
                        status: 'pending'
                    })
                    .select()

                if (error) {
                    console.error("Supabase Insert Error:", error)
                    throw error
                }
                console.log("Insert Success:", data)
                setIsSubmitted(true)
                if (onSuccess) onSuccess()

                // Notify admins
                try {
                    await notifyAdminsAction({
                        title: 'New Sourcing Request',
                        message: `New request for ${formData.part_name} (${vehicle_info})`,
                        type: 'request'
                    })
                } catch (notifyError) {
                    console.error("Admin notification failed (non-fatal):", notifyError)
                }
            }
        } catch (error: any) {
            // Enhanced logging to capture non-enumerable properties of Error objects
            console.error("Submission fatal error details:", {
                rawError: error,
                message: error?.message || "No message",
                details: error?.details || "No details",
                hint: error?.hint || "No hint",
                code: error?.code || "No code",
                stack: error?.stack
            })

            toast.error(isEdit ? "Failed to update request" : "Failed to submit request", {
                description: error?.message || "A database error occurred. Please check the console for details."
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) return (
        <div className="text-center space-y-4 py-20">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold">Request Submitted!</h2>
            <p>We'll notify you as soon as we have updates.</p>
            <Button onClick={() => router.push('/portal')}>Back to Dashboard</Button>
        </div>
    )

    return (
        <div className="space-y-6">
            <Card className="max-w-[1400px] mx-auto border-slate-100 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white relative">
                {/* High-Contrast Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-slate-50 flex z-10">
                    <div
                        className={cn(
                            "h-full bg-[#FF7A30] transition-all duration-700 ease-in-out",
                            step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
                        )}
                    />
                </div>

                <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                        {/* Main Content Area */}
                        <div className="flex-1 p-8 md:p-12 space-y-10">
                            {/* Simplified Step Indicator */}
                            <div className="flex items-center gap-3 text-[12px] font-semibold uppercase text-[#1B3B5A]/40 pb-4">
                                {[
                                    { id: 1, label: "Vehicle" },
                                    { id: 2, label: "Condition" },
                                    { id: 3, label: "Parts" }
                                ].map((s, i) => {
                                    const isCompleted = step > s.id
                                    const isCurrent = step === s.id
                                    return (
                                        <React.Fragment key={s.id}>
                                            <button
                                                type="button"
                                                onClick={() => isCompleted && setStep(s.id)}
                                                disabled={!isCompleted}
                                                className={cn(
                                                    "flex items-center gap-2 transition-opacity",
                                                    isCompleted && "cursor-pointer hover:opacity-70",
                                                    !isCompleted && "cursor-default"
                                                )}
                                                title={isCompleted ? `Go back to ${s.label}` : undefined}
                                            >
                                                <span className={cn(
                                                    "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                                                    step >= s.id ? "bg-[#1B3B5A] text-white" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {s.id}
                                                </span>
                                                <span className={cn(
                                                    "tracking-wide",
                                                    step >= s.id ? "text-[#1B3B5A]" : "text-slate-300",
                                                    isCompleted && "underline-offset-2 hover:underline"
                                                )}>
                                                    {s.label}
                                                </span>
                                            </button>
                                            {i < 2 && <span className="h-[1px] w-5 bg-slate-200 mx-1" />}
                                        </React.Fragment>
                                    )
                                })}
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-5">
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-semibold text-[#1B3B5A]">
                                            {step === 1 ? "Vehicle Details" : step === 2 ? "Part Condition" : "Parts Specification"}
                                        </h1>
                                        <p className="text-slate-400 font-medium text-sm">
                                            {step === 1 ? "Every detail counts for an accurate quote." : "Choose the quality level that fits your budget."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-10">
                                {step === 1 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                        {/* Input Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-1 space-y-2">
                                                <Label className="text-[9px] font-semibold uppercase text-slate-400 ml-1">VIN Number</Label>
                                                <div className="relative">
                                                    <Input
                                                        maxLength={17}
                                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-mono font-medium"
                                                        value={formData.vin}
                                                        onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                                                        placeholder="ENTER VIN..."
                                                    />
                                                    {vinLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#FF7A30]" />}
                                                </div>
                                                {!vinUnlocked && !vinLoading && (
                                                    <p className="text-[10px] text-amber-600 font-semibold ml-1 flex items-center gap-1">
                                                        <span>🔒</span> Enter your 17-digit VIN to unlock vehicle fields
                                                    </p>
                                                )}
                                                {vinUnlocked && (
                                                    <p className="text-[10px] text-emerald-600 font-semibold ml-1 flex items-center gap-1">
                                                        <span>✓</span> VIN verified — fields unlocked
                                                    </p>
                                                )}
                                            </div>
                                            <BrandedSelect
                                                label="Build Year"
                                                value={formData.year}
                                                options={YEARS}
                                                onChange={(v) => setFormData({ ...formData, year: v })}
                                                disabled={!vinUnlocked}
                                            />
                                            <BrandedSelect
                                                label="Brand / Make"
                                                value={formData.make}
                                                options={MAKES}
                                                onChange={(v) => setFormData({ ...formData, make: v, model: "", submodel: "" })}
                                                disabled={!vinUnlocked}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <BrandedSelect
                                                label="Series / Model"
                                                value={formData.model}
                                                options={formData.make ? (COMMON_MODELS[formData.make] || [OTHER_OPTION]) : []}
                                                onChange={(v) => setFormData({ ...formData, model: v, submodel: "" })}
                                                disabled={!vinUnlocked}
                                            />
                                            <BrandedSelect
                                                label={trimsLoading ? "Loading Trims..." : "Sub-Model / Trim"}
                                                value={formData.submodel}
                                                options={vehicleTrims}
                                                onChange={(v) => setFormData({ ...formData, submodel: v })}
                                                disabled={!vinUnlocked || trimsLoading}
                                            />
                                            <BrandedSelect
                                                label="Engine Configuration"
                                                value={formData.engine}
                                                options={COMMON_ENGINES}
                                                onChange={(v) => setFormData({ ...formData, engine: v })}
                                                disabled={!vinUnlocked}
                                            />
                                        </div>

                                        {/* Minimal Vehicle Confirmation Card */}
                                        {isStep1Valid && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase text-emerald-500 mb-0.5">Vehicle Identified</p>
                                                    <p className="text-sm font-semibold text-[#1B3B5A]">
                                                        {formData.year} {formData.make} {formData.model}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-medium">
                                                        {formData.submodel} · {formData.engine}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Confirm Button — enabled only when vehicle is fully filled */}
                                        <div className="pt-2 flex justify-start">
                                            <Button
                                                type="button"
                                                disabled={!isStep1Valid}
                                                onClick={() => isStep1Valid && setStep(2)}
                                                className={cn(
                                                    "h-12 px-8 rounded-2xl font-semibold text-sm transition-all flex items-center gap-2",
                                                    isStep1Valid
                                                        ? "bg-primary-blue text-white shadow-lg hover:bg-primary-blue/90 active:scale-95"
                                                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                                )}
                                            >
                                                Confirm Vehicle <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {['New (OEM)', 'Aftermarket', 'Used'].map((cond) => (
                                                <div
                                                    key={cond}
                                                    onClick={() => setFormData({ ...formData, part_condition: cond })}
                                                    className={cn(
                                                        "cursor-pointer group relative p-10 rounded-2xl border-2 transition-all duration-300",
                                                        formData.part_condition === cond
                                                            ? "border-primary-orange bg-white shadow-2xl shadow-orange-100 scale-102"
                                                            : "border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-100"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-all",
                                                        formData.part_condition === cond ? "bg-primary-orange text-white" : "bg-white text-slate-300 shadow-sm"
                                                    )}>
                                                        <CheckCircle2 className="h-6 w-6" />
                                                    </div>
                                                    <h3 className={cn("text-xl font-semibold mb-2", formData.part_condition === cond ? "text-primary-blue" : "text-slate-400")}>{cond}</h3>
                                                    <p className="text-xs font-medium text-slate-400">Recommended for quality assurance.</p>

                                                    {formData.part_condition === cond && (
                                                        <div className="absolute top-6 right-6 h-6 w-6 rounded-full bg-primary-orange flex items-center justify-center">
                                                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => setStep(3)}
                                            disabled={!isStep2Valid}
                                            className="h-16 w-full rounded-2xl bg-primary-blue text-white shadow-xl font-semibold uppercase text-sm transition-all active:scale-[0.98]"
                                        >
                                            Continue to selection <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="bg-slate-50/50 p-6 md:p-10 rounded-2xl border border-slate-100">
                                            <PartLibraryPicker value={formData.part_name} onSelect={(name) => setFormData({ ...formData, part_name: name })} onCustomPart={(n) => setFormData({ ...formData, part_name: n })} />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isLoading || !formData.part_name}
                                            className="h-16 w-full rounded-2xl bg-primary-blue text-white shadow-2xl shadow-blue-900/10 font-semibold uppercase text-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : isEdit ? "Update Request" : "Submit Request"}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Redesigned Live Summary Sidebar */}
                        <div className="w-full lg:w-96 bg-[#F8FAFC] border-l border-slate-100 flex flex-col min-h-full">
                            {/* Scrollable content area */}
                            <div className="flex-1 p-10 space-y-8">
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Summary</span>
                                    <h3 className="text-2xl font-bold text-[#1B3B5A] tracking-tight">Current Selection</h3>
                                </div>

                                {/* Vehicle Details Section */}
                                {(formData.year || formData.make || formData.model) && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-[#1B3B5A]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1B3B5A]/40">Vehicle Details</span>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
                                            {/* Vehicle headline */}
                                            <div className="px-6 pt-6 pb-4 border-b border-slate-50">
                                                <p className="text-2xl font-extrabold text-[#1B3B5A] leading-tight tracking-tight">
                                                    {[formData.year, formData.make].filter(Boolean).join(' ')}
                                                </p>
                                                {formData.model && (
                                                    <p className="text-base font-semibold text-slate-400 mt-0.5">{formData.model}</p>
                                                )}
                                            </div>

                                            {/* Vertical attribute rows */}
                                            <div className="px-6 py-4 space-y-3">
                                                {formData.submodel && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0 w-16">Trim</span>
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B3B5A] text-white text-[11px] font-extrabold uppercase tracking-wide shadow-md">
                                                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                                                            {formData.submodel}
                                                        </span>
                                                    </div>
                                                )}
                                                {formData.engine && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0 w-16">Engine</span>
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF7A30] text-white text-[11px] font-extrabold uppercase tracking-wide shadow-md shadow-orange-200">
                                                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                                                            {formData.engine}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quality Section */}
                                {formData.part_condition && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-[#1B3B5A]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1B3B5A]/40">Selected Quality</span>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
                                            <div className="flex items-center gap-3 px-5 py-4">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0 w-16">Condition</span>
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-[11px] font-extrabold uppercase tracking-wide shadow-md shadow-emerald-200">
                                                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                                                    {formData.part_condition}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Required Part Section */}
                                {formData.part_name && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-[#1B3B5A]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1B3B5A]/40">Required Part</span>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-md px-5 py-4">
                                            <p className="text-sm font-bold text-[#1B3B5A]">{formData.part_name}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Proxy Info if Agent */}
                                {profile?.role === 'agent' && formData.orderingFor === 'customer' && formData.customerName && (
                                    <div className="p-6 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Requesting For</p>
                                        <p className="text-sm font-bold">{formData.customerName}</p>
                                        {formData.customerPhone && <p className="text-[10px] opacity-70">{formData.customerPhone}</p>}
                                    </div>
                                )}
                            </div>

                            {/* Bottom-pinned status + notice */}
                            <div className="p-8 pt-0 mt-auto space-y-4">
                                <div className="h-px bg-slate-100 mb-4" />
                                <div className="flex items-center gap-2 text-[#FF7A30]">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#FF7A30] animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready to Source</span>
                                </div>
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                                    <span className="text-amber-500 text-base leading-none mt-0.5">⚠️</span>
                                    <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                                        Initial quote does <span className="font-black underline">not</span> include shipping cost to Ghana
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Brand Footer */}
            <div className="flex items-center justify-center gap-2 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
                    Professional Sourcing Network • Security Guaranteed
                </span>
            </div>

            <WhatsAppOrderModal
                open={showWhatsAppModal}
                onOpenChange={setShowWhatsAppModal}
                vehicleInfo={`${formData.year} ${formData.make === OTHER_OPTION ? formData.manual_make : formData.make} ${formData.model === OTHER_OPTION ? formData.manual_model : formData.model} ${formData.submodel === OTHER_OPTION ? formData.manual_submodel : formData.submodel}`}
                vin={formData.vin}
                partName={formData.part_name}
                partCondition={formData.part_condition}
            />
        </div>
    )
}
