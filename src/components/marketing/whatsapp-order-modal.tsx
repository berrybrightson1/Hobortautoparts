"use client"

import { useState } from "react"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SmartPhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { Mail, MessageCircle, Car, Wrench } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Business WhatsApp number ───
const WHATSAPP_NUMBER = "16784966882"

interface WhatsAppOrderModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    // Pre-fill from quote form — all optional when used standalone
    vehicleInfo?: string
    vin?: string
    partName?: string
    partCondition?: string
}

export function WhatsAppOrderModal({
    open,
    onOpenChange,
    vehicleInfo = "",
    vin = "",
    partName = "",
    partCondition = "",
}: WhatsAppOrderModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        vehicle: vehicleInfo,
        vin: vin,
        part: partName,
        condition: partCondition,
        notes: "",
    })

    const isPrefilled = !!(vehicleInfo || partName)

    const handleOpen = (v: boolean) => {
        if (!v) {
            // Reset only the user-entered fields, keep pre-filled ones
            setFormData(prev => ({ ...prev, name: "", phone: "", email: "", notes: "" }))
        }
        onOpenChange(v)
    }

    const set = (field: keyof typeof formData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setFormData(prev => ({ ...prev, [field]: e.target.value }))

    const buildMessage = () => {
        const vehicle = formData.vehicle || "Not specified"
        const vinLine = formData.vin ? `\n*VIN:* ${formData.vin}` : ""
        const condLine = formData.condition ? `\n*Condition:* ${formData.condition}` : ""
        const notesLine = formData.notes ? `\n\n*Additional Notes:*\n${formData.notes}` : ""

        return `🚗 *Parts Request — Auto Parts Express*
━━━━━━━━━━━━━━━━━
*Customer:* ${formData.name || "Not provided"}
*Phone:* ${formData.phone || "Not provided"}
*Email:* ${formData.email || "Not provided"}
━━━━━━━━━━━━━━━━━
*Vehicle:* ${vehicle}${vinLine}
*Part Needed:* ${formData.part || "Not specified"}${condLine}${notesLine}
━━━━━━━━━━━━━━━━━
_Sent via Auto Parts Express_`
    }

    const handleSubmit = () => {
        if (!formData.phone) {
            toast.error("Phone number required", {
                description: "Please provide a phone number so our agent can reach you."
            })
            return
        }
        if (!formData.part && !partName) {
            toast.error("Part required", { description: "Please tell us what part you need." })
            return
        }

        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`
        window.open(url, "_blank", "noopener,noreferrer")
        handleOpen(false)
    }

    const canSubmit = !!formData.phone && !!(formData.part || partName)

    return (
        <ResponsiveModal
            open={open}
            onOpenChange={handleOpen}
            title="Order via WhatsApp"
            description="Fill in your details and we'll open WhatsApp with everything ready to send."
            size="md"
        >
            <div className="overflow-y-auto max-h-[80vh]">
                {/* Green header banner */}
                <div className="mx-6 md:mx-8 mt-2 mb-6 bg-[#25D366]/10 rounded-2xl p-4 border border-[#25D366]/20 flex gap-3 items-start">
                    <div className="h-9 w-9 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0">
                        <MessageCircle className="h-5 w-5 text-white fill-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#128C7E]">Instant Agent Response</p>
                        <p className="text-xs text-[#128C7E]/80 font-medium leading-relaxed mt-0.5">
                            Your message will be pre-filled. Just hit send in WhatsApp — an agent typically responds within minutes.
                        </p>
                    </div>
                </div>

                <div className="px-6 md:px-8 space-y-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Name</Label>
                        <Input
                            placeholder="e.g. Kwame Mensah"
                            value={formData.name}
                            onChange={set("name")}
                            className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-sm"
                        />
                    </div>

                    {/* Phone + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Your Phone <span className="text-red-500">*</span>
                            </Label>
                            <SmartPhoneInput
                                value={formData.phone}
                                onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email (optional)</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="email"
                                    placeholder="you@gmail.com"
                                    className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-sm"
                                    value={formData.email}
                                    onChange={set("email")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 pt-1" />

                    {/* Vehicle */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Vehicle <span className={cn(!isPrefilled && "text-red-500")}>*</span>
                        </Label>
                        <div className="relative">
                            <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="e.g. 2015 Toyota Corolla 1.8L — or paste your VIN"
                                value={formData.vehicle}
                                onChange={set("vehicle")}
                                readOnly={isPrefilled}
                                className={cn(
                                    "pl-10 h-11 rounded-xl border-slate-200 text-sm",
                                    isPrefilled ? "bg-slate-50 text-slate-500 cursor-default" : "bg-slate-50 focus:bg-white"
                                )}
                            />
                        </div>
                        {formData.vin && (
                            <p className="text-[10px] text-slate-400 font-medium ml-1">VIN: {formData.vin}</p>
                        )}
                    </div>

                    {/* Part needed */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Part Needed <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="e.g. Brake Rotors, Water Pump, Alternator..."
                                value={formData.part}
                                onChange={set("part")}
                                readOnly={isPrefilled}
                                className={cn(
                                    "pl-10 h-11 rounded-xl border-slate-200 text-sm",
                                    isPrefilled ? "bg-slate-50 text-slate-500 cursor-default" : "bg-slate-50 focus:bg-white"
                                )}
                            />
                        </div>
                        {formData.condition && (
                            <p className="text-[10px] text-slate-400 font-medium ml-1">Condition preference: {formData.condition}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Extra Notes <span className="text-slate-300 normal-case font-normal tracking-normal">(optional)</span>
                        </Label>
                        <Textarea
                            placeholder="Budget range, urgency, brand preference, delivery location..."
                            value={formData.notes}
                            onChange={set("notes")}
                            rows={3}
                            className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-sm resize-none"
                        />
                    </div>

                    {/* Live preview */}
                    {(formData.name || formData.phone || formData.part || formData.vehicle) && (
                        <div className="bg-[#e9fde0] rounded-2xl p-4 border border-[#25D366]/20">
                            <p className="text-[10px] font-bold text-[#128C7E] uppercase tracking-widest mb-2">Message Preview</p>
                            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                                {buildMessage()}
                            </pre>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="pt-2 pb-6">
                        <Button
                            className={cn(
                                "w-full h-14 rounded-2xl font-bold text-base shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2",
                                canSubmit
                                    ? "bg-[#25D366] hover:bg-[#128C7E] text-white shadow-[#25D366]/30 hover:scale-[1.01]"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                        >
                            <MessageCircle className="h-5 w-5 fill-current" />
                            Send via WhatsApp
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 font-medium mt-3">
                            This will open WhatsApp with your message pre-filled. Just press Send.
                        </p>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    )
}
