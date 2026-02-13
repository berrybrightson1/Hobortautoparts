"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, CheckCircle2, XCircle, Clock, User, Mail, Building2, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

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

            toast.success("Agent approved!", {
                description: "The agent account has been activated."
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

            toast.success("Agent rejected", {
                description: "The application has been declined and removed."
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
            <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-4">
                        Agent Approvals <ShieldCheck className="h-8 w-8 text-primary-orange" />
                    </h2>
                    <p className="text-slate-500 font-medium">Review and approve agent affiliate applications.</p>
                </div>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-primary-orange border-t-transparent rounded-full"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-4">
                    Agent Approvals <ShieldCheck className="h-8 w-8 text-primary-orange" />
                </h2>
                <p className="text-slate-500 font-medium">Review and approve agent affiliate applications.</p>
            </div>

            {pendingAgents.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingAgents.map((agent) => (
                        <Card key={agent.id} className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white group hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 border-l-4 border-l-amber-400">
                            <CardHeader className="bg-gradient-to-br from-slate-50 to-white pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            <User className="h-5 w-5 text-primary-orange" />
                                            {agent.full_name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4" />
                                            {agent.email}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                        <Clock className="h-3 w-3" />
                                        Pending
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-3 text-sm">
                                    {agent.company_name && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                            <span className="font-medium">{agent.company_name}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <span>Applied {new Date(agent.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={() => handleApprove(agent.id)}
                                        disabled={processingId === agent.id}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => handleReject(agent.id)}
                                        disabled={processingId === agent.id}
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white py-20">
                    <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
                        <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                            <ShieldCheck className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-semibold text-slate-900">All caught up!</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                There are no pending agent applications at this time.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
