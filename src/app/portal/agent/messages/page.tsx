"use client"

import * as React from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Loader2, MessageSquare, Search, Package, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"
import { RequestChat } from "@/components/chat/request-chat"

export default function AgentMessagesPage() {
    const { user, profile } = useAuth()
    const [activeTab, setActiveTab] = React.useState<string | null>(null)
    const [requests, setRequests] = React.useState<any[]>([])
    const [isLoadingRequests, setIsLoadingRequests] = React.useState(true)

    React.useEffect(() => {
        if (user) {
            fetchAssignedRequests()
        }
    }, [user])

    const fetchAssignedRequests = async () => {
        try {
            // Fetch requests where agent_id is the current user's ID
            const { data, error } = await supabase
                .from('sourcing_requests')
                .select(`
                    id, 
                    part_name, 
                    created_at, 
                    status, 
                    vehicle_info,
                    profiles:user_id (full_name, avatar_url)
                `)
                .eq('agent_id', user!.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setRequests(data || [])

            // Auto-select first request if available
            if (data && data.length > 0 && !activeTab) {
                setActiveTab(data[0].id)
            }
        } catch (error) {
            console.error("Error fetching assigned requests:", error)
        } finally {
            setIsLoadingRequests(false)
        }
    }

    if (!user) return null

    const activeRequest = requests.find(r => r.id === activeTab)

    return (
        <div className="flex-1 flex bg-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search requests..."
                            className="pl-9 bg-white border-slate-200 rounded-xl h-9 text-sm focus:ring-primary-blue/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    <div className="px-3 pt-2 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Requests</span>
                    </div>

                    {isLoadingRequests ? (
                        <div className="px-4 py-8 flex justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-xs text-slate-400">No assigned requests found</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <button
                                key={req.id}
                                onClick={() => setActiveTab(req.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                                    activeTab === req.id
                                        ? "bg-white shadow-sm ring-1 ring-slate-100"
                                        : "hover:bg-slate-100/50"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                                    activeTab === req.id ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-purple-600"
                                )}>
                                    <Package className="h-5 w-5" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={cn("font-medium text-sm truncate", activeTab === req.id ? "text-slate-900" : "text-slate-700")}>
                                            {req.part_name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 shrink-0">
                                            {format(new Date(req.created_at), 'MMM d')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{req.profiles?.full_name || 'Unknown User'}</p>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{req.vehicle_info || 'No vehicle info'}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {activeTab ? (
                    <RequestChat
                        requestId={activeTab}
                        requestTitle={activeRequest?.part_name || 'Request Chat'}
                        currentUserId={user.id}
                        isAgent={true}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4 opacity-50">
                        <MessageSquare className="h-16 w-16" />
                        <p className="text-sm font-medium uppercase tracking-widest">Select a request to view messages</p>
                    </div>
                )}
            </div>
        </div>
    )
}
