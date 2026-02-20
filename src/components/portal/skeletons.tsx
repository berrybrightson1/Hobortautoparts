"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-100", className)}
            {...props}
        />
    )
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-8 rounded-2xl border border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm space-y-4">
                    <Skeleton className="h-10 w-10 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="p-8 rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <div className="flex gap-4">
                    <Skeleton className="h-12 flex-1 rounded-xl" />
                    <Skeleton className="h-12 flex-1 rounded-xl" />
                </div>
            </div>
        </div>
    )
}

export function ListSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-2xl border border-slate-50 bg-white/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-20 rounded-full" />
                </div>
            ))}
        </div>
    )
}
