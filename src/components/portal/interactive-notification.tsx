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
                    initial={{ opacity: 0, y: 50, scale: 0.3, x: 100 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        x: 0,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.1,
                        x: 200,
                        y: -500,
                        transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
                    }}
                    className={cn(
                        "fixed bottom-8 right-8 z-[9999] w-[320px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 p-4 overflow-hidden",
                        notification.link ? "cursor-pointer hover:bg-slate-50 active:scale-[0.98] transition-all" : ""
                    )}
                    onClick={() => {
                        if (notification.link) {
                            router.push(notification.link)
                            onClose()
                        }
                    }}
                >
                    <div className="flex gap-4">
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg", bgColor)}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0 pr-8 space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{notification.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notification.message}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onClose()
                            }}
                            className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                            aria-label="Close notification"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1 bg-slate-100"
                        onAnimationComplete={onClose}
                    />
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
}
