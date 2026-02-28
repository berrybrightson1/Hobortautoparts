"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Bug, ChevronDown, Search, RefreshCw, ExternalLink, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type BugStatus = "open" | "in_progress" | "resolved" | "dismissed";

interface BugReport {
    id: string;
    created_at: string;
    user_email: string | null;
    category: string;
    description: string;
    steps_to_reproduce: string | null;
    status: BugStatus;
    page_url: string | null;
}

const STATUS_META: Record<BugStatus, { label: string; color: string }> = {
    open: { label: "Open", color: "bg-red-50 text-red-600 border-red-200" },
    in_progress: { label: "In Progress", color: "bg-amber-50 text-amber-600 border-amber-200" },
    resolved: { label: "Resolved", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    dismissed: { label: "Dismissed", color: "bg-slate-100 text-slate-500 border-slate-200" },
};

export default function BugReportsPage() {
    const [reports, setReports] = useState<BugReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<BugStatus | "all">("all");
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchReports = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("bug_reports")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) setReports(data as BugReport[]);
        setLoading(false);
    };

    useEffect(() => { fetchReports(); }, []);

    const updateStatus = async (id: string, status: BugStatus) => {
        setUpdating(id);
        await supabase.from("bug_reports").update({ status }).eq("id", id);
        setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
        setUpdating(null);
    };

    const filtered = reports.filter((r) => {
        const matchesStatus = filter === "all" || r.status === filter;
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            r.category.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            (r.user_email ?? "").toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    const counts = {
        all: reports.length,
        open: reports.filter((r) => r.status === "open").length,
        in_progress: reports.filter((r) => r.status === "in_progress").length,
        resolved: reports.filter((r) => r.status === "resolved").length,
        dismissed: reports.filter((r) => r.status === "dismissed").length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#0b1f3a] flex items-center justify-center">
                            <Bug className="h-5 w-5 text-[#f97316]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#0b1f3a]">Bug Reports</h1>
                            <p className="text-sm text-slate-500">{counts.open} open · {counts.all} total</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchReports}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    {(["all", "open", "in_progress", "resolved", "dismissed"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                                filter === s
                                    ? "bg-[#0b1f3a] text-white border-[#0b1f3a]"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {s === "all" ? "All" : STATUS_META[s].label}
                            <span className="ml-1.5 opacity-60">{counts[s]}</span>
                        </button>
                    ))}
                    <div className="ml-auto relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search reports…"
                            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-400 w-52 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Reports list */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
                        <Bug className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-500">No bug reports found</p>
                        <p className="text-xs text-slate-400 mt-1">Reports submitted by users will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((report) => {
                            const isExpanded = expanded === report.id;
                            const meta = STATUS_META[report.status] ?? STATUS_META.open;

                            return (
                                <div key={report.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                    {/* Row */}
                                    <div
                                        className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                                        onClick={() => setExpanded(isExpanded ? null : report.id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", meta.color)}>
                                                    {meta.label}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {report.category}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-800 truncate">{report.description}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[11px] text-slate-400">{report.user_email ?? "Anonymous"}</span>
                                                <span className="text-[11px] text-slate-300">·</span>
                                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                                </span>
                                                {report.page_url && (
                                                    <>
                                                        <span className="text-[11px] text-slate-300">·</span>
                                                        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">{report.page_url}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronDown className={cn("h-4 w-4 text-slate-400 shrink-0 mt-1 transition-transform", isExpanded && "rotate-180")} />
                                    </div>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 px-5 py-4 space-y-4 bg-slate-50/50">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Description</p>
                                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{report.description}</p>
                                            </div>

                                            {report.steps_to_reproduce && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Steps to Reproduce</p>
                                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{report.steps_to_reproduce}</p>
                                                </div>
                                            )}

                                            {report.page_url && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Page</p>
                                                    <a
                                                        href={report.page_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                    >
                                                        {report.page_url}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                            )}

                                            {/* Status update buttons */}
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Update Status</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(["open", "in_progress", "resolved", "dismissed"] as BugStatus[]).map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => updateStatus(report.id, s)}
                                                            disabled={report.status === s || updating === report.id}
                                                            className={cn(
                                                                "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                                                                report.status === s
                                                                    ? cn(STATUS_META[s].color, "cursor-default")
                                                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            {updating === report.id && report.status !== s ? (
                                                                <Loader2 className="h-3 w-3 animate-spin inline" />
                                                            ) : (
                                                                STATUS_META[s].label
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
