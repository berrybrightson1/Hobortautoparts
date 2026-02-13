"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { MessageCircle, FileText, ShoppingCart, ShieldCheck, Truck, Play } from "lucide-react"

// Steps data from HowItWorksPage
const STEPS = [
    {
        title: "Request",
        description: "Submit details via WhatsApp or Hub.",
        icon: MessageCircle,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        border: "border-emerald-100"
    },
    {
        title: "Quote",
        description: "Receive transparent invoice.",
        icon: FileText,
        color: "text-primary-blue",
        bg: "bg-blue-50",
        border: "border-blue-100"
    },
    {
        title: "Acquisition",
        description: "Secure procurement from US.",
        icon: ShoppingCart,
        color: "text-primary-orange",
        bg: "bg-orange-50",
        border: "border-orange-100"
    },
    {
        title: "Verification",
        description: "Physical audit by US agents.",
        icon: ShieldCheck,
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100"
    },
    {
        title: "Shipment",
        description: "Fast clearing & delivery.",
        icon: Truck,
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-100"
    }
]

interface VideoModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    trigger?: React.ReactNode
}

export function VideoModal({ open, onOpenChange, trigger }: VideoModalProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")
    // TODO: Replace with actual YouTube Video ID provided by user
    const VIDEO_ID = "dQw4w9WgXcQ" // Placeholder (Rick Roll for testing, or use generic) -> Let's use a generic nature one or leave blank.
    // Changing to a generic tech background video or just a placeholder message if preferred.
    // For now, using a valid ID to demonstrate the player.
    const YOUTUBE_URL = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=0&rel=0&modestbranding=1`

    const content = (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
            {/* Video Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-white/10 group">
                <iframe
                    width="100%"
                    height="100%"
                    src={YOUTUBE_URL}
                    title="How Autoparts Express Works"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0"
                />
            </div>

            {/* Minimal 5-Step Process */}
            <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 opacity-50 mb-2">
                    <div className="h-px w-12 bg-slate-300"></div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Our Process</span>
                    <div className="h-px w-12 bg-slate-300"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {STEPS.map((step, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex md:flex-col items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                                "bg-white hover:shadow-md hover:-translate-y-0.5",
                                step.border
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full shrink-0 shadow-sm",
                                step.bg,
                                step.color
                            )}>
                                <step.icon className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <div className="text-left md:text-center min-w-0 flex-1">
                                <div className="text-xs md:text-sm font-bold text-slate-700 leading-tight mb-0.5">
                                    {step.title}
                                </div>
                                <div className="text-[10px] text-slate-400 leading-tight line-clamp-2 md:line-clamp-3">
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                {trigger && <div onClick={() => onOpenChange(true)}>{trigger}</div>}
                <DialogContent className="sm:max-w-5xl p-6 bg-white/95 backdrop-blur-xl border-white/20">
                    <DialogHeader className="mb-2">
                        <DialogTitle className="text-2xl font-bold text-center text-slate-800">
                            Experience the Autoparts Express Difference
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            See how we identify, source, and deliver your parts with precision.
                        </DialogDescription>
                    </DialogHeader>
                    {content}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
            <DrawerContent className="bg-white/95 backdrop-blur-xl max-h-[90vh]">
                <DrawerHeader className="text-left">
                    <DrawerTitle>How it Works</DrawerTitle>
                    <DrawerDescription>
                        A transparent 5-step journey.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pt-2 overflow-y-auto">
                    {content}
                </div>
            </DrawerContent>
        </Drawer>
    )
}
