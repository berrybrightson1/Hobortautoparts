"use client"

import * as React from "react"
import { Search, Package, Users, Truck, CornerDownLeft } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function CommandSearch() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const filteredOrders: any[] = []
    const filteredUsers: any[] = []

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:border-blue-200 transition-all shadow-sm hover:shadow-md group min-w-[300px]"
            >
                <Search className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                <span className="text-xs font-bold tracking-tight">Search platform...</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-[0_48px_160px_-24px_rgba(0,0,0,0.3)] rounded-2xl top-[12%] bg-white/90 backdrop-blur-3xl ring-1 ring-white/40">
                    <DialogTitle className="sr-only">Universal Search</DialogTitle>
                    <div className="flex flex-col min-h-[500px] max-h-[750px] relative">
                        {/* Search Input Area */}
                        <div className="flex items-center px-10 h-32 relative">
                            <Search className="h-8 w-8 text-primary-blue mr-8 shrink-0 stroke-[3px]" />
                            <Input
                                autoFocus
                                placeholder="What are you looking for?"
                                className="flex-1 h-full border-0 focus-visible:ring-0 text-3xl font-black text-slate-900 placeholder:text-slate-200 transition-all bg-transparent p-0"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="flex items-center gap-4">
                                <kbd className="hidden sm:inline-flex h-10 px-4 rounded-2xl bg-slate-900/5 text-[12px] font-black text-slate-400 items-center uppercase tracking-widest border border-slate-100">
                                    ESC
                                </kbd>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar lg:no-scrollbar scroll-smooth">
                            {query.length <= 1 ? (
                                <div className="space-y-12 py-6">
                                    <div className="space-y-6">
                                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] px-2">Global Navigation Core</p>
                                        <div className="grid grid-cols-2 gap-6">
                                            {[
                                                { icon: Package, label: 'Shipment Database', desc: 'Track and manage orders', color: 'blue' },
                                                { icon: Users, label: 'Entity Network', desc: 'Manage agents & users', color: 'orange' },
                                            ].map((action) => (
                                                <button
                                                    key={action.label}
                                                    className="group flex flex-col gap-4 p-8 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all text-left relative overflow-hidden"
                                                >
                                                    <div className={cn(
                                                        "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm",
                                                        action.color === 'blue' ? "bg-blue-600 text-white shadow-blue-500/20" : "bg-orange-500 text-white shadow-orange-500/20"
                                                    )}>
                                                        <action.icon className="h-8 w-8" />
                                                    </div>
                                                    <div>
                                                        <span className="text-lg font-black text-slate-900 uppercase tracking-tight block">{action.label}</span>
                                                        <span className="text-sm font-medium text-slate-400">{action.desc}</span>
                                                    </div>
                                                    <div className="absolute top-6 right-6 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity">
                                                        <CornerDownLeft className="h-4 w-4 text-slate-900" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center py-12 opacity-10 text-center space-y-4">
                                        <Search className="h-12 w-12 text-slate-400" />
                                        <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-500">Intelligent Indexing Active</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10 py-4">
                                    {filteredOrders.length === 0 && filteredUsers.length === 0 && (
                                        <div className="h-64 flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                                            <Search className="h-12 w-12 text-slate-300" />
                                            <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Zero Results • Refine Query</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Immersive Footer Indicator */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 pointer-events-none opacity-40">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                Core Intelligence Link Active
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
