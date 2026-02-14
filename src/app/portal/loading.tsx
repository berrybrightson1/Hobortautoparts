import { StatsSkeleton, CardSkeleton } from "@/components/portal/skeletons"

export default function PortalLoading() {
    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Placeholder */}
            <div className="space-y-2">
                <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-4 w-96 bg-slate-100 rounded-lg animate-pulse" />
            </div>

            {/* Stats Grid Placeholder */}
            <StatsSkeleton />

            {/* Main Content Grid Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    )
}
