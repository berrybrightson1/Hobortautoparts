"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"

interface ResponsiveModalProps {
    children: React.ReactNode
    title?: string
    description?: string
    open: boolean
    onOpenChange: (open: boolean) => void
    variant?: "center" | "bottom"
    size?: "sm" | "md" | "lg" | "xl" | "full"
    scrollable?: boolean
}

export function ResponsiveModal({
    children,
    title,
    description,
    open,
    onOpenChange,
    variant = "center",
    size = "sm",
    scrollable = true
}: ResponsiveModalProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const sizeClasses = {
        sm: "sm:max-w-[500px]",
        md: "sm:max-w-[700px]",
        lg: "sm:max-w-[900px]",
        xl: "sm:max-w-[1200px]",
        full: "sm:max-w-[95vw]"
    }

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={cn(
                    "border-none shadow-[0_48px_160px_-24px_rgba(0,0,0,0.35)] p-0 bg-white dark:bg-white ring-1 ring-black/[0.05] overflow-hidden transition-all duration-300",
                    variant === "center"
                        ? cn(sizeClasses[size], "rounded-2xl top-[50%] translate-y-[-50%] max-h-[90vh]")
                        : "sm:max-w-[600px] rounded-full top-auto bottom-8 translate-y-0",
                    "fixed left-[50%] translate-x-[-50%] flex flex-col"
                )}>
                    {title ? (
                        <DialogHeader className="p-8 pb-0 shrink-0">
                            <DialogTitle className="text-2xl font-semibold tracking-tight uppercase text-slate-900">{title}</DialogTitle>
                            {description && (
                                <DialogDescription className="font-medium text-slate-400">{description}</DialogDescription>
                            )}
                        </DialogHeader>
                    ) : (
                        <div className="sr-only">
                            <DialogTitle>Modal Dialog</DialogTitle>
                            <DialogDescription>Content for the modal dialog</DialogDescription>
                        </div>
                    )}
                    <div className={cn(
                        "flex-1 p-1 flex flex-col min-h-0",
                        scrollable ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden"
                    )}>
                        {children}
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="rounded-t-[2.5rem] border-none bg-white dark:bg-white pb-8 max-h-[96vh] flex flex-col">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 my-4" />
                <div className="flex flex-col flex-1 overflow-hidden">
                    {title ? (
                        <DrawerHeader className="text-left px-8 pt-4">
                            <DrawerTitle className="text-xl font-semibold tracking-tight uppercase text-slate-900">{title}</DrawerTitle>
                            {description && (
                                <DrawerDescription className="font-medium text-slate-400">{description}</DrawerDescription>
                            )}
                        </DrawerHeader>
                    ) : (
                        <DrawerTitle className="sr-only">Notification</DrawerTitle>
                    )}
                    <div className={cn(
                        "flex-1 min-h-0 px-2 flex flex-col",
                        scrollable ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden"
                    )}>
                        {children}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
