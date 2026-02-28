"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Bug, Send, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BUG_CATEGORIES = [
    // Navigation & Layout
    "Page not loading",
    "Page crashed or froze",
    "Blank or empty screen",
    "Incorrect redirect / wrong page",
    // UI & Display
    "UI element misaligned or broken",
    "Text or label is wrong",
    "Image or icon not displaying",
    "Modal or drawer won't open/close",
    "Responsive / mobile layout issue",
    // Actions & Buttons
    "Button or link not working",
    "Form won't submit",
    "Action confirms but nothing happens",
    "Can't upload a file",
    // Orders & Requests
    "Order not showing up",
    "Wrong order status displayed",
    "Unable to create a new request",
    "Order details are incorrect",
    "Tracking information missing or wrong",
    // Notifications
    "Notification not received",
    "Wrong notification content",
    "Notification badge not updating",
    // Payments & Billing
    "Invoice not generating",
    "Invoice download broken",
    "Payment status not updating",
    "Billing details incorrect",
    // Account & Access
    "Can't log in",
    "Logged out unexpectedly",
    "Can't access a page (permission error)",
    "Profile data not saving",
    // Data & Sync
    "Wrong data shown",
    "Data not refreshing / updating",
    "Duplicate records appearing",
    // Performance
    "Page loading very slowly",
    "Request timing out",
    // Other
    "Feature behaving unexpectedly",
    "Other",
] as const;

type BugCategory = (typeof BUG_CATEGORIES)[number];

interface BugReportModalProps {
    open: boolean;
    onClose: () => void;
}

export function BugReportModal({ open, onClose }: BugReportModalProps) {
    const { user } = useAuth();
    const [category, setCategory] = useState<BugCategory | "">("");
    const [description, setDescription] = useState("");
    const [steps, setSteps] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [search, setSearch] = useState("");
    const catRef = useRef<HTMLDivElement>(null);

    // Close category dropdown on outside click
    useEffect(() => {
        if (!catOpen) return;
        const handler = (e: MouseEvent) => {
            if (catRef.current && !catRef.current.contains(e.target as Node)) {
                setCatOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [catOpen]);

    const filteredCategories = BUG_CATEGORIES.filter((c) =>
        c.toLowerCase().includes(search.toLowerCase())
    );

    const reset = () => {
        setCategory("");
        setDescription("");
        setSteps("");
        setSubmitted(false);
        setLoading(false);
        setCatOpen(false);
        setSearch("");
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !category) return;

        setLoading(true);
        try {
            const { error } = await supabase.from("bug_reports").insert({
                user_id: user?.id ?? null,
                user_email: user?.email ?? null,
                category,
                description: description.trim(),
                steps_to_reproduce: steps.trim() || null,
                status: "open",
                page_url: typeof window !== "undefined" ? window.location.pathname : null,
                user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
            });

            if (error) throw error;

            setSubmitted(true);
            toast.success("Bug report submitted", {
                description: "Our team has been notified. Thank you!",
            });
        } catch {
            toast.error("Failed to submit report", {
                description: "Please try again or contact support.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop — clicking closes modal */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
                aria-hidden
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal
                aria-label="Report a Bug"
                className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[500px] bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-[#0b1f3a] to-[#0f2d40] px-6 pt-6 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <Bug className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white leading-tight">Report a Bug</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Help us improve by describing what went wrong.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {submitted ? (
                    /* Success state */
                    <div className="flex flex-col items-center justify-center py-10 px-8 text-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-900">Report received!</p>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                Our team has been notified and will look into this shortly. Thank you for helping make HAPE better.
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="mt-2 px-6 py-2.5 bg-[#0b1f3a] text-white text-sm font-semibold rounded-xl hover:bg-[#0f2d40] transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

                        {/* Category */}
                        <div className="space-y-1.5" ref={catRef}>
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setCatOpen((o) => !o)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm bg-white transition-colors text-left",
                                    catOpen ? "border-slate-400 ring-2 ring-slate-100" : "border-slate-200 hover:border-slate-300",
                                    !category ? "text-slate-400" : "text-slate-800 font-medium"
                                )}
                            >
                                {category || "Select a category…"}
                                <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform shrink-0", catOpen && "rotate-180")} />
                            </button>

                            {catOpen && (
                                <div className="relative z-20">
                                    <div className="absolute w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                                        {/* Search within categories */}
                                        <div className="px-2 pt-2 pb-1 border-b border-slate-100">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search categories…"
                                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 outline-none focus:border-slate-400 placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredCategories.length === 0 ? (
                                                <p className="text-xs text-slate-400 text-center py-3">No matches found</p>
                                            ) : (
                                                filteredCategories.map((cat) => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => { setCategory(cat); setCatOpen(false); setSearch(""); }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0",
                                                            category === cat ? "bg-slate-50 font-semibold text-slate-900" : "text-slate-600"
                                                        )}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                What happened? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the bug clearly — what you saw vs. what you expected…"
                                rows={3}
                                required
                                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none transition-colors placeholder:text-slate-400"
                            />
                        </div>

                        {/* Steps */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Steps to reproduce{" "}
                                <span className="text-slate-400 font-normal normal-case">(optional)</span>
                            </label>
                            <textarea
                                value={steps}
                                onChange={(e) => setSteps(e.target.value)}
                                placeholder="1. Go to…  2. Click…  3. See error…"
                                rows={2}
                                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none resize-none transition-colors placeholder:text-slate-400"
                            />
                        </div>

                        {/* Meta info */}
                        <div className="bg-slate-50 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
                            <svg className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                            </svg>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Your email and the current page URL will be captured automatically to help us investigate faster.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !description.trim() || !category}
                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-3.5 w-3.5" />
                                )}
                                {loading ? "Submitting…" : "Submit Report"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
