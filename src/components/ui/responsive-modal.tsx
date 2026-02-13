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
}

export function ResponsiveModal({
    children,
    title,
    description,
    open,
    onOpenChange,
    variant = "center",
}: ResponsiveModalProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={cn(
                    "border-none shadow-[0_48px_160px_-24px_rgba(0,0,0,0.35)] p-0 overflow-hidden bg-white/95 backdrop-blur-xl ring-1 ring-black/[0.05]",
                    variant === "center"
                        ? "sm:max-w-[425px] rounded-[2.5rem] top-[50%] translate-y-[-50%]"
                        : "sm:max-w-[600px] rounded-full top-auto bottom-8 translate-y-0",
                    "fixed left-[50%] translate-x-[-50%] flex flex-col items-center"
                )}>
                    {title ? (
                        <DialogHeader className="p-6 pb-0 w-full">
                            <DialogTitle>{title}</DialogTitle>
                            {description && (
                                <DialogDescription>{description}</DialogDescription>
                            )}
                        </DialogHeader>
                    ) : (
                        <DialogTitle className="sr-only">Notification</DialogTitle>
                    )}
                    <div className={cn("w-full", variant === "center" ? "p-6" : "p-4")}>{children}</div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="rounded-t-[2.5rem] border-none bg-white/95 backdrop-blur-xl">
                {title ? (
                    <DrawerHeader className="text-left px-6 pt-6">
                        <DrawerTitle>{title}</DrawerTitle>
                        {description && (
                            <DrawerDescription>{description}</DrawerDescription>
                        )}
                    </DrawerHeader>
                ) : (
                    <DrawerTitle className="sr-only">Notification</DrawerTitle>
                )}
                <div className="px-6 pb-12 pt-4">{children}</div>
            </DrawerContent>
        </Drawer>
    )
}
