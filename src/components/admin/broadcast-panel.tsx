"use client"

import * as React from "react"
import { Megaphone, Loader2, Send, Clock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { broadcastAnnouncement, getBroadcastHistory } from "@/app/actions/admin-actions"
import { format } from "date-fns"

export function BroadcastPanel() {
    const [title, setTitle] = React.useState("")
    const [message, setMessage] = React.useState("")
    const [isSending, setIsSending] = React.useState(false)
    const [history, setHistory] = React.useState<any[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = React.useState(true)

    const fetchHistory = React.useCallback(async () => {
        setIsLoadingHistory(true)
        const result = await getBroadcastHistory()
        if (result.success) {
            setHistory(result.data)
        }
        setIsLoadingHistory(false)
    }, [])

    React.useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !message.trim()) {
            toast.error("Missing Fields", { description: "Please provide both a title and message." })
            return
        }

        setIsSending(true)
        try {
            const result = await broadcastAnnouncement(title.trim(), message.trim())

            if (result.success) {
                toast.success("Broadcast Sent", {
                    description: `Successfully alerted ${result.count} users across the platform.`
                })
                setTitle("")
                setMessage("")
                fetchHistory() // Refresh history after sending
            } else {
                toast.error("Broadcast Failed", { description: result.error })
            }
        } catch (error: any) {
            toast.error("System Error", { description: "An unexpected error occurred." })
        } finally {
            setIsSending(false)
        }
    }

    const handleResend = (pastTitle: string, pastMessage: string) => {
        setTitle(pastTitle)
        setMessage(pastMessage)
    }

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-0 shadow-xl shadow-slate-200/40 relative overflow-hidden group flex flex-col lg:flex-row">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110 duration-700" />

            {/* Left Side: Broadcast Form */}
            <div className="relative z-10 p-6 sm:p-8 lg:w-3/5 lg:border-r border-slate-100">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 shadow-inner shrink-0">
                        <Megaphone className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Platform Broadcast</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1">
                            Push a high-priority system alert to every registered user (Customers, Agents, and Admins). The notification will drop down instantly on their screens.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Announcement Title</label>
                        <Input
                            placeholder="e.g., Scheduled Maintenance"
                            className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isSending}
                            maxLength={50}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Message Body</label>
                        <Textarea
                            placeholder="Type your message here..."
                            className="min-h-[100px] resize-none rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors p-3"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isSending}
                            maxLength={200}
                        />
                        <div className="flex justify-end pr-1">
                            <span className="text-[10px] text-slate-400 font-bold">{message.length}/200</span>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isSending || !title.trim() || !message.trim()}
                            className="h-11 px-8 rounded-xl bg-primary-blue hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Broadcasting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Dispatch Alert
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Right Side: Broadcast History Log */}
            <div className="relative z-10 bg-slate-50/80 p-6 sm:p-8 lg:w-2/5 flex flex-col max-h-[500px]">
                <div className="flex items-center gap-2 mb-6 shrink-0">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Broadcast History</h4>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {isLoadingHistory ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-60 py-10">
                            <Megaphone className="h-8 w-8 text-slate-300" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No Past Broadcasts</p>
                        </div>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors group">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <h5 className="text-sm font-bold text-slate-900 truncate">{item.title}</h5>
                                    <button
                                        type="button"
                                        onClick={() => handleResend(item.title, item.message)}
                                        className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:underline shrink-0"
                                    >
                                        <RotateCcw className="h-3 w-3" /> Re-send
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                    {item.message}
                                </p>
                                <div className="flex items-center justify-between text-[10px] font-bold tracking-tight text-slate-400">
                                    <span>{format(new Date(item.created_at), 'MMM dd, yyyy • HH:mm')}</span>
                                    <span>Sent to {item.recipient_count} users</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
