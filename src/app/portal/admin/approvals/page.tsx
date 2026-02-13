"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, FileText, CheckCircle2, XCircle, Clock, Inbox, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export default function ApprovalsPage() {
    const [requests] = useState<any[]>([])

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-4">
                    Compliance & Approvals <ShieldCheck className="h-8 w-8 text-primary-orange" />
                </h2>
                <p className="text-slate-500 font-medium">Review and verify Agent and Wholesale account applications.</p>
            </div>

            {requests.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {requests.map((request) => (
                        <Card key={request.id} className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 border-l-4 border-l-primary-orange/20">
                            {/* ... existing card content ... */}
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white py-20">
                    <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
                        <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                            <ShieldCheck className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-semibold text-slate-900">All caught up!</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">There are no pending account applications or KYC requests at this time.</p>
                        </div>
                        <Button variant="outline" className="rounded-xl border-slate-200 gap-2">
                            <Search className="h-4 w-4" /> View Verified Database
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
