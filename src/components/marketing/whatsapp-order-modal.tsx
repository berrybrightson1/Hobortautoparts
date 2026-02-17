import { useState } from "react"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SmartPhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { Mail, MessageCircle, AlertCircle, FileText } from "lucide-react"
import { toast } from "sonner"

interface WhatsAppOrderModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    vehicleInfo: string
    vin: string
    partName: string
    partCondition: string
}

export function WhatsAppOrderModal({ open, onOpenChange, vehicleInfo, vin, partName, partCondition }: WhatsAppOrderModalProps) {
    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        description: ''
    })

    const handleWhatsAppRedirect = () => {
        if (!formData.phone || !formData.email) {
            toast.error("Missing Requirements", {
                description: "Please provide your phone number and email for follow-up."
            })
            return
        }

        const message = `*New Fast-Track Order Request*
----------------
*Vehicle Profile:* ${vehicleInfo}
*VIN:* ${vin}
----------------
*Customer Request:*
${formData.description || "No specific details provided."}

*(Context: User was looking for ${partName} in ${partCondition} condition)*
----------------
*Customer Contact:*
*Phone:* ${formData.phone}
*Email:* ${formData.email}
----------------
Please provide a quote for this request. I await your response.`

        const encodedMessage = encodeURIComponent(message)
        // Use the official business number if available, otherwise generic
        const phoneNumber = "260977422998" // Replace with actual business number if different
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
        onOpenChange(false)
    }

    return (
        <ResponsiveModal
            open={open}
            onOpenChange={onOpenChange}
            title="Order via WhatsApp"
            description="Submit your request directly to our agents for simpler processing."
            size="md"
        >
            <div className="px-6 md:px-8 py-6 overflow-y-auto">
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 mb-8 flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-emerald-700">Direct Agent Access</h4>
                        <p className="text-xs text-emerald-600/80 font-medium leading-relaxed">
                            Skip the queue by describing exactly what you need. Our agents will process your request directly via WhatsApp.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="wa-desc" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                            Describe Your Request <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-4 h-4 w-4 text-slate-400" />
                            <Textarea
                                id="wa-desc"
                                placeholder="I need a... (e.g. Front bumper for 2015 Ranger, specific brand preference, etc.)"
                                className="pl-10 min-h-[120px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all resize-none py-4 pr-4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="wa-phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                                Call Number <span className="text-red-500">*</span>
                            </Label>
                            <SmartPhoneInput
                                id="wa-phone"
                                value={formData.phone}
                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="wa-email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                                Gmail Address <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="wa-email"
                                    type="email"
                                    placeholder="example@gmail.com"
                                    className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 text-center">
                        <AlertCircle className="h-3 w-3" /> Required for official quote documentation
                    </p>
                </div>

                <div className="pt-8 pb-4">
                    <Button
                        className="w-full h-14 md:h-16 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        onClick={handleWhatsAppRedirect}
                        disabled={!formData.phone || !formData.email || !formData.description}
                    >
                        Proceed to WhatsApp <MessageCircle className="ml-2 h-6 w-6" />
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    )
}
