"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Clock, MapPin, Package, Truck } from "lucide-react"
import { format } from "date-fns"

interface TimelineEvent {
    id: string
    status: string
    location: string
    description: string
    occurred_at: string
}

interface ShipmentTimelineProps {
    events: TimelineEvent[]
    currentStatus?: string
}

export function ShipmentTimeline({ events, currentStatus }: ShipmentTimelineProps) {
    // Sort events by date (newest first)
    const sortedEvents = [...events].sort((a, b) =>
        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    )

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-60">
                <Package className="h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">No tracking updates yet.</p>
            </div>
        )
    }

    return (
        <div className="relative pl-6 space-y-8 my-4">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-100" />

            {sortedEvents.map((event, index) => {
                const isLatest = index === 0
                const isDelivered = event.status === 'delivered'

                return (
                    <div key={event.id} className="relative group">
                        {/* Dot Indicator */}
                        <div className={cn(
                            "absolute left-[-1.5rem] mt-1.5 h-6 w-6 rounded-full border-4 flex items-center justify-center transition-colors shadow-sm z-10",
                            isLatest
                                ? (isDelivered ? "bg-emerald-500 border-emerald-100" : "bg-primary-blue border-blue-100")
                                : "bg-slate-200 border-slate-50"
                        )}>
                            {isLatest ? (
                                <div className="h-2 w-2 rounded-full bg-white" />
                            ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            )}
                        </div>

                        {/* Content Card */}
                        <div className={cn(
                            "rounded-xl p-4 border transition-all",
                            isLatest
                                ? "bg-white border-slate-200 shadow-md"
                                : "bg-slate-50/50 border-slate-100 opacity-80"
                        )}>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className={cn(
                                            "font-bold text-sm uppercase tracking-wide",
                                            isLatest ? "text-slate-900" : "text-slate-500"
                                        )}>
                                            {event.status.replace(/_/g, ' ')}
                                        </h4>
                                        {isLatest && (
                                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                                        {event.description}
                                    </p>
                                    <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-slate-500">
                                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                        {event.location}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100/50 px-2 py-1 rounded-lg w-fit h-fit whitespace-nowrap">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(event.occurred_at), 'MMM dd, HH:mm')}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
