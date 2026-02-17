"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Package, Tag, PackageSearch, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Notification {
    id: string
    title: string
    message: string
    type: 'order' | 'promo' | 'system' | 'request'
    link?: string | null
}

interface InteractiveNotificationProps {
    notification: Notification | null
    onClose: () => void
}

export function InteractiveNotification({ notification, onClose }: InteractiveNotificationProps) {
    const router = useRouter()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const Icon = notification ? ({
        order: Package,
        promo: Tag,
        request: PackageSearch,
        system: Info
    }[notification.type] || Bell) : Bell

    const bgColor = notification ? ({
        order: "bg-orange-500",
        promo: "bg-blue-500",
        request: "bg-emerald-500",
        system: "bg-slate-700"
    }[notification.type] || "bg-primary-blue") : "bg-primary-blue"

    if (!mounted) return null

    return createPortal(
        <AnimatePresence mode="wait">
            {notification && (
                <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -40, x: 40, scale: 0.2 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        x: 0,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        y: -40,
                        x: 40,
                        scale: 0.2,
                        transition: { duration: 0.4, ease: "easeIn" }
                    }}
                    className={cn(
                        "fixed top-[90px] right-6 z-[9999] w-[340px] bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 p-5 overflow-hidden ring-1 ring-black/[0.05]",
                        notification.link ? "cursor-pointer hover:bg-white active:scale-[0.98] transition-all" : ""
                    )}
                    onClick={() => {
                        if (notification.link) {
                            router.push(notification.link)
                            onClose()
                        }
                    }}
                >
                    <div className="flex gap-4 items-center">
                        <div className={cn("h-12 w-12 rounded-[1.25rem] flex items-center justify-center shrink-0 text-white shadow-lg shadow-black/5", bgColor)}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0 pr-8 space-y-0.5">
                            <h4 className="text-[13px] font-bold text-slate-900 truncate leading-tight">{notification.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug font-medium">{notification.message}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onClose()
                            }}
                            className="absolute top-4 right-4 p-1.5 hover:bg-slate-100/50 rounded-full text-slate-400 transition-colors"
                            aria-label="Close notification"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1 bg-primary-blue/10"
                        onAnimationComplete={onClose}
                    />
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
}
