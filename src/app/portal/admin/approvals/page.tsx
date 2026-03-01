'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, ShieldAlert, UserCheck, Timer, AlertTriangle, ArrowRight, RefreshCw, FileText, MapPin, Briefcase, Box, ShieldCheck, Mail, Phone, Factory } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { updateUserRole, getPendingAgents, declinePendingAgent } from "@/app/actions/admin-actions"
import { useRouter } from "next/navigation"

export default function AdminApprovalsPage() {
    const router = useRouter()
    const [pendingAgents, setPendingAgents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null)
    const [isReviewOpen, setIsReviewOpen] = useState(false)
    const [isActioning, setIsActioning] = useState(false)
    const [stats, setStats] = useState({
        processingOrders: 0,
        newRequests: 0
    })

    const fetchData = async () => {
        setIsRefreshing(true)
        try {
            // 1. Fetch Agents
            const agentsRes = await getPendingAgents()
            if (agentsRes.success && agentsRes.data) {
                setPendingAgents(agentsRes.data)
            }

            // 2. Fetch Pending Sourcing Requests count (unassigned)
            const { count: newRequestsCount } = await supabase
                .from('sourcing_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')
                .is('agent_id', null)

            // 3. Fetch Processing Orders count (no shipment)
            // This is a bit more complex, let's look for orders with status paid/processing
            const { data: ordersData } = await supabase
                .from('orders')
                .select('id, status')
                .in('status', ['paid', 'processing'])

            // To truly check if they have no shipment, we'd need a join or a separate check
            // For now, let's fetch IDs and then check shipments table
            const orderIds = ordersData?.map(o => o.id) || []
            let processingOrdersCount = 0

            if (orderIds.length > 0) {
                const { data: shipmentsData } = await supabase
                    .from('shipments')
                    .select('order_id')
                    .in('order_id', orderIds)

                const shippedOrderIds = new Set(shipmentsData?.map(s => s.order_id) || [])
                processingOrdersCount = orderIds.filter(id => !shippedOrderIds.has(id)).length
            }

            setStats({
                newRequests: newRequestsCount || 0,
                processingOrders: processingOrdersCount
            })

        } catch (error: any) {
            console.error("Error fetching approval stats:", error)
            toast.error("Sync Failed", { description: "Could not refresh Action Center metrics." })
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()

        // Listen to Profiles Table changes for real-time pending agent updates
        const profilesChannel = supabase
            .channel('approvals_profiles_tracker')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(profilesChannel);
        };
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Action Center</h2>
                    <p className="text-slate-500 font-medium">Items requiring administrative approval or attention.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchData}
                    disabled={isRefreshing}
                    className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900"
                >
                    <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} /> Refresh
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-slate-50 p-6">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <UserCheck className="h-5 w-5 text-blue-600" /> Agent Network Status
                        </CardTitle>
                        <CardDescription>Review active agents and their performance.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider pl-6 h-12">Agent Name</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Email</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Joined</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-xs uppercase tracking-wider h-12">Status</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-500 text-xs uppercase tracking-wider pr-6 h-12">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingAgents.length > 0 ? (
                                    pendingAgents.map((agent) => (
                                        <TableRow key={agent.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                            <TableCell className="pl-6 py-4 font-bold text-slate-900">
                                                {agent.full_name}
                                            </TableCell>
                                            <TableCell className="py-4 text-slate-500">
                                                {agent.email}
                                            </TableCell>
                                            <TableCell className="py-4 text-xs font-mono text-slate-400">
                                                {format(new Date(agent.created_at || new Date()), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-0 uppercase text-[10px] tracking-wider font-bold">
                                                    Pending Review
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4 space-x-2 flex items-center justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-lg text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-blue-50/50"
                                                    onClick={() => {
                                                        setSelectedAgent(agent)
                                                        setIsReviewOpen(true)
                                                    }}
                                                >
                                                    Review Application
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-400 font-medium">
                                            No agents found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden bg-slate-900 text-white h-fit">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                            <ShieldAlert className="h-5 w-5 text-orange-500" /> Pending Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-200">Processing Orders</p>
                                    <p className="text-xs text-slate-500">Orders requiring shipment</p>
                                </div>
                                <Badge className="bg-blue-500 text-white border-0 font-mono text-xs">{stats.processingOrders}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-200">New Requests</p>
                                    <p className="text-xs text-slate-500">Unassigned sourcing requests</p>
                                </div>
                                <Badge className="bg-orange-500 text-white border-0 font-mono text-xs">{stats.newRequests}</Badge>
                            </div>
                        </div>

                        <Button
                            onClick={() => router.push('/portal/admin/requests?filter=unassigned')}
                            className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold h-12 rounded-xl"
                        >
                            Process Queue <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Application Review Modal */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white dark:bg-white text-slate-900">
                    <div className="bg-white px-6 py-6 border-b border-slate-100">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl">Review Agent Application</DialogTitle>
                                    <DialogDescription className="text-slate-500 mt-1">
                                        Submitted {selectedAgent ? format(new Date(selectedAgent.created_at), 'PPP') : ''}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Profile Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 bg-white p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><UserCheck className="h-3 w-3" /> Full Name</p>
                                <p className="font-semibold text-slate-900">{selectedAgent?.full_name}</p>
                            </div>
                            <div className="space-y-1 bg-white p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email Address</p>
                                <p className="font-semibold text-slate-900">{selectedAgent?.email}</p>
                            </div>
                            <div className="space-y-1 bg-white p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Phone className="h-3 w-3" /> Phone Number</p>
                                <p className="font-semibold text-slate-900">{selectedAgent?.phone_number || 'N/A'}</p>
                            </div>
                            <div className="space-y-1 bg-white p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> Company Name</p>
                                <p className="font-semibold text-slate-900">{selectedAgent?.questionnaire?.company_name || 'Individual'}</p>
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-200" />

                        {/* Business Specs */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-blue-500" /> Operational Specs
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100">
                                    <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Operating Region</p>
                                        <p className="text-sm font-semibold">{selectedAgent?.questionnaire?.location || 'N/A'}</p>
                                        {selectedAgent?.questionnaire?.city && (
                                            <p className="text-xs text-slate-500">{selectedAgent.questionnaire.city}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100">
                                    <Factory className="h-4 w-4 text-orange-500 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Expertise</p>
                                        <p className="text-sm font-semibold">{selectedAgent?.questionnaire?.expertise || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100">
                                    <Timer className="h-4 w-4 text-emerald-500 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Sourcing Experience</p>
                                        <p className="text-sm font-semibold">{selectedAgent?.questionnaire?.years_experience || 0} Years</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100">
                                    <Box className="h-4 w-4 text-purple-500 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Expected weekly Vol.</p>
                                        <p className="text-sm font-semibold">{selectedAgent?.questionnaire?.expected_volume || 0} Orders</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Yes/No Specs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={cn("p-4 rounded-xl border flex flex-col justify-center items-center text-center", selectedAgent?.questionnaire?.vendor_relationships ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500")}>
                                <p className="text-xs font-bold uppercase mb-1">Ext. Vendor Network</p>
                                <p className="text-lg font-black">{selectedAgent?.questionnaire?.vendor_relationships ? "YES" : "NO"}</p>
                            </div>
                            <div className={cn("p-4 rounded-xl border flex flex-col justify-center items-center text-center", selectedAgent?.questionnaire?.storage_capacity ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500")}>
                                <p className="text-xs font-bold uppercase mb-1">Secure Storage Cap.</p>
                                <p className="text-lg font-black">{selectedAgent?.questionnaire?.storage_capacity ? "YES" : "NO"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100">
                        <DialogFooter className="flex items-center sm:justify-between w-full">
                            <Button
                                variant="outline"
                                onClick={() => setIsReviewOpen(false)}
                                disabled={isActioning}
                                className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900"
                            >
                                Cancel
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    disabled={isActioning}
                                    onClick={async () => {
                                        setIsActioning(true)
                                        const res = await declinePendingAgent(selectedAgent?.id, selectedAgent?.email, selectedAgent?.full_name);
                                        if (res.success) {
                                            toast.success("Application Declined", { description: "The agent's profile has been rejected and removed." })
                                            setIsReviewOpen(false)
                                            fetchData()
                                        } else {
                                            toast.error("Decline Failed", { description: res.error })
                                        }
                                        setIsActioning(false)
                                    }}
                                    className="rounded-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Decline
                                </Button>
                                <Button
                                    disabled={isActioning}
                                    onClick={async () => {
                                        setIsActioning(true)
                                        const res = await updateUserRole(selectedAgent?.id, 'agent');
                                        if (res.success) {
                                            toast.success("Agent Approved", { description: "Application successfully passed. The agent now has full pipeline access." })
                                            setIsReviewOpen(false)
                                            fetchData()
                                        } else {
                                            toast.error("Approval Failed", { description: res.error })
                                        }
                                        setIsActioning(false)
                                    }}
                                    className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Agent
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
