"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Search, MapPin, Package, Loader2, RefreshCw, Activity, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/portal/search-bar"
import { Pagination } from "@/components/portal/pagination"

export default function CustomerTrackingPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [shipments, setShipments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)

    const fetchShipments = async () => {
        if (!user) return
        setIsLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('shipments')
                .select(`
                    *,
                    orders!inner (
                        user_id,
                        quotes (
                            sourcing_requests (part_name)
                        )
                    )
                `)
                .eq('orders.user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setShipments(data || [])
        } catch (error: any) {
            console.error("Error fetching shipments:", error)
            setError(error.message || "Failed to load shipments")
            toast.error("Tracking Offline", { description: "Could not sync your shipment status." })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchShipments()
    }, [user])

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1) // Reset to first page on new search
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const filteredShipments = shipments.filter(s =>
        s.tracking_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.orders?.quotes?.sourcing_requests?.part_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
    )

    const totalPages = Math.ceil(filteredShipments.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginatedShipments = filteredShipments.slice(startIndex, startIndex + pageSize)

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-slate-900 leading-none">Track Orders</h2>
                    <p className="text-slate-500 font-normal text-lg pt-2">Real-time logistics and shipment monitoring for your parts.</p>
                </div>
                <Button variant="outline" onClick={fetchShipments} className="rounded-xl border-slate-200">
                    <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Update Live
                </Button>
            </div>

            <div className="flex justify-center">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Enter Tracking ID or Ref Number..."
                    className="w-full max-w-2xl"
                />
            </div>

            {isLoading ? (
                <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-orange" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Syncing Logistics...</p>
                </div>
            ) : error ? (
                <div className="h-[40vh] flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="h-20 w-20 bg-red-50 rounded-3xl flex items-center justify-center shadow-sm border border-red-100">
                        <Activity className="h-10 w-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900">Tracking Unavailable</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">{error}</p>
                    </div>
                    <Button onClick={fetchShipments} variant="outline" className="rounded-xl h-12 px-8 border-red-200 text-red-700 hover:bg-red-50">
                        <RefreshCw className="mr-2 h-4 w-4" /> Retry Sync
                    </Button>
                </div>
            ) : filteredShipments.length > 0 ? (
                <div className="grid gap-6">
                    {paginatedShipments.map((shipment) => (
                        <Card key={shipment.id} className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100/50 hover:shadow-2xl transition-all duration-300">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-blue-100">
                                        <Truck className="h-8 w-8 text-primary-blue" />
                                    </div>
                                    <div className="flex-1 space-y-2 min-w-0 w-full text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <h3 className="text-2xl font-semibold tracking-tight text-slate-900 truncate uppercase tracking-widest">
                                                #{shipment.tracking_number}
                                            </h3>
                                            <Badge className="w-fit mx-auto md:mx-0 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg border-none shadow-sm font-medium text-[10px] uppercase tracking-widest whitespace-nowrap">
                                                {shipment.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-500 truncate">
                                            {shipment.orders?.quotes?.sourcing_requests?.part_name || 'Vehicle Part Shipment'}
                                        </p>
                                        <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] uppercase font-black tracking-tighter text-slate-400">
                                            <span className="flex items-center gap-2">
                                                <MapPin className="h-3 w-3" /> {shipment.origin_hub}
                                            </span>
                                            <ChevronRight className="h-3 w-3" />
                                            <span className="flex items-center gap-2">
                                                <MapPin className="h-3 w-3" /> {shipment.destination_hub}
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="rounded-xl h-12 px-6 group border border-slate-100 hover:bg-slate-50" onClick={() => router.push(`/portal/customer/tracking/${shipment.id}`)}>
                                        Monitor <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredShipments.length > pageSize && (
                        <div className="pt-8 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalCount={filteredShipments.length}
                                pageSize={pageSize}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white ring-1 ring-slate-100/50 p-8">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center ring-1 ring-slate-100">
                            <Package className="h-10 w-10 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">No active shipments</h3>
                            <p className="text-slate-500 text-lg max-w-sm">Once your parts are in transit, you can track their journey here in real-time.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                    { title: "Global Logistics", text: "We partner with top-tier carriers for safe delivery.", icon: MapPin },
                    { title: "Insured Transit", text: "All shipments are fully insured until they reach you.", icon: Package },
                    { title: "Live Updates", text: "Get notified the moment your order reaches a new milestone.", icon: Activity }
                ].map((item, i) => (
                    <div key={i} className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 transition-all hover:shadow-md">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                            <item.icon className="h-6 w-6 text-slate-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-normal">{item.text}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
