"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, FileText, CheckCircle2, XCircle, Clock } from "lucide-react"
import { DEMO_KYC_REQUESTS } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

export default function ApprovalsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-4">
                    Compliance & Approvals <ShieldCheck className="h-8 w-8 text-primary-orange" />
                </h2>
                <p className="text-slate-500 font-medium">Review and verify Agent and Wholesale account applications.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {DEMO_KYC_REQUESTS.map((request) => (
                    <Card key={request.id} className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 border-l-4 border-l-primary-orange/20">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-2xl font-semibold text-slate-900 tracking-tight">{request.name}</CardTitle>
                                        <Badge variant="outline" className="rounded-full bg-blue-50 text-blue-600 border-blue-100 font-semibold px-3">
                                            {request.type}
                                        </Badge>
                                    </div>
                                    <CardDescription className="font-medium text-slate-400 flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5" /> Applied: {request.appliedDate}
                                    </CardDescription>
                                </div>
                                <Badge className={cn(
                                    "rounded-full px-4 py-1 font-semibold uppercase tracking-widest text-[9px]",
                                    request.status === 'Pending' ? "bg-orange-100 text-orange-600 shadow-sm" : "bg-blue-100 text-blue-600"
                                )}>
                                    {request.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Submitted Documents</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {request.documents.map(doc => (
                                        <div key={doc} className="flex items-center gap-3 p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all cursor-pointer group/doc">
                                            <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/doc:text-blue-500 group-hover/doc:shadow-md transition-all">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600">{doc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <Button className="flex-1 rounded-[1.5rem] h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 text-md transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    <CheckCircle2 className="mr-2 h-5 w-5" /> Approve Account
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-[1.5rem] h-14 border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 font-semibold text-md transition-all">
                                    <XCircle className="mr-2 h-5 w-5" /> Reject
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
