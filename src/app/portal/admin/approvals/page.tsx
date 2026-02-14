"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, CheckCircle2, XCircle, Clock, User, Mail, Building2, Calendar, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { sendNotification } from "@/lib/notifications"

interface PendingAgent {
    id: string
    full_name: string
    email: string
    company_name: string | null
    created_at: string
    agent_status: string | null
}

export default function ApprovalsPage() {
    const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        fetchPendingAgents()
    }, [])

    async function fetchPendingAgents() {
        setIsLoading(true)
        try {
            // Fetch all profiles with role 'agent'
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, role, created_at')
                .eq('role', 'agent')

            if (profilesError) throw profilesError

            if (!profiles || profiles.length === 0) {
                setPendingAgents([])
                setIsLoading(false)
                return
            }

            // Fetch auth users to get emails
            const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

            // Create a map of user IDs to emails
            const emailMap = new Map(users?.map(u => [u.id, u.email]) || [])

            // Fetch agent records to check status
            const { data: agents, error: agentsError } = await supabase
                .from('agents')
                .select('id, status')
                .in('id', profiles.map(p => p.id))

            const agentStatusMap = new Map(agents?.map(a => [a.id, a.status]) || [])

            // Combine data and filter for pending or no agent record
            const pending = profiles
                .map(profile => ({
                    id: profile.id,
                    full_name: profile.full_name || 'Unknown',
                    email: emailMap.get(profile.id) || 'No email',
                    company_name: null,
                    created_at: profile.created_at,
                    agent_status: agentStatusMap.get(profile.id) || null
                }))
                .filter(agent => !agent.agent_status || agent.agent_status === 'pending')

            setPendingAgents(pending)
        } catch (error: any) {
            console.error('Error fetching pending agents:', error)
            toast.error("Failed to load pending agents", {
                description: error.message
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleApprove(agentId: string) {
        setProcessingId(agentId)
        try {
            // Check if agent record exists
            const { data: existingAgent } = await supabase
                .from('agents')
                .select('id')
                .eq('id', agentId)
                .single()

            if (existingAgent) {
                // Update existing agent
                const { error } = await supabase
                    .from('agents')
                    .update({ status: 'active' })
                    .eq('id', agentId)

                if (error) throw error
            } else {
                // Create new agent record
                const { error } = await supabase
                    .from('agents')
                    .insert({
                        id: agentId,
                        referral_code: `AG-${Date.now().toString(36).toUpperCase()}`,
                        status: 'active'
                    })

                if (error) throw error
            }

            // Send instant notification to the agent
            await sendNotification({
                userId: agentId,
                title: '🎉 Application Approved!',
                message: 'Congratulations! Your partner agent application has been approved. You now have full access to the agent portal.',
                type: 'system'
            })

            toast.success("Agent approved!", {
                description: "The agent account has been activated and notified."
            })

            // Refresh the list
            fetchPendingAgents()
        } catch (error: any) {
            console.error('Error approving agent:', error)
            toast.error("Failed to approve agent", {
                description: error.message
            })
        } finally {
            setProcessingId(null)
        }
    }

    async function handleReject(agentId: string) {
        setProcessingId(agentId)
        try {
            // Delete the profile (cascades to auth.users)
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', agentId)

            if (error) throw error

            toast.success("Application rejected", {
                description: "The agent application has been declined and removed."
            })

            // Refresh the list
            fetchPendingAgents()
        } catch (error: any) {
            console.error('Error rejecting agent:', error)
            toast.error("Failed to reject agent", {
                description: error.message
            })
        } finally {
            setProcessingId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col gap-3">
                    <h2 className="text-3xl font-bold text-slate-900">Agent Approvals</h2>
                    <p className="text-slate-600">Review and approve agent affiliate applications</p>
                </div>
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-blue" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                        <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Agent Approvals</h2>
                        <p className="text-sm sm:text-base text-slate-600">Review and approve agent affiliate applications</p>
                    </div>
                </div>
                {pendingAgents.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1">
                            {pendingAgents.length} Pending Application{pendingAgents.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Applications Grid */}
            {pendingAgents.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingAgents.map((agent) => (
                        <Card key={agent.id} className="border-slate-200 shadow-lg hover:shadow-xl rounded-3xl overflow-hidden bg-white group transition-all duration-300 hover:-translate-y-1">
                            <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 p-5 sm:p-6 sm:pb-5">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary-blue to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shrink-0">
                                                {agent.full_name.charAt(0)}
                                            </div>
                                            {agent.full_name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-xs sm:text-sm pl-10 sm:pl-12 break-all">
                                            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                            {agent.email}
                                        </CardDescription>
                                    </div>
                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 px-3 py-1 w-fit">
                                        <Clock className="h-3.5 w-3.5" />
                                        Pending
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-5 sm:pt-6 space-y-5">
                                <div className="space-y-3 text-xs sm:text-sm">
                                    {agent.company_name && (
                                        <div className="flex items-center gap-3 text-slate-700 bg-slate-50 rounded-xl p-3">
                                            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                                            <span className="font-medium truncate">{agent.company_name}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-slate-700 bg-slate-50 rounded-xl p-3">
                                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span>Applied on {new Date(agent.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button
                                        onClick={() => handleApprove(agent.id)}
                                        disabled={processingId === agent.id}
                                        className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl gap-2 shadow-lg shadow-emerald-500/30 font-semibold text-xs sm:text-sm"
                                    >
                                        {processingId === agent.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4" />
                                        )}
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => handleReject(agent.id)}
                                        disabled={processingId === agent.id}
                                        variant="outline"
                                        className="flex-1 h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-2xl gap-2 font-semibold text-xs sm:text-sm"
                                    >
                                        {processingId === agent.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <XCircle className="h-4 w-4" />
                                        )}
                                        Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-slate-200 shadow-lg rounded-3xl overflow-hidden bg-white">
                    <CardContent className="flex flex-col items-center justify-center text-center space-y-6 py-32">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                            <ShieldCheck className="h-12 w-12 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900">All Caught Up!</h3>
                            <p className="text-slate-600 max-w-md mx-auto">
                                There are no pending agent applications at this time. New applications will appear here for review.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
