"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    PackageSearch,
    Settings,
    LogOut,
    UserCircle,
    ShieldAlert,
    Menu,
    X,
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"
import { usePortalStore } from "@/lib/store"
import { SimulationEngine } from "@/components/portal/simulation-engine"
import { NotificationDrawer } from "@/components/portal/notification-drawer"
import { ResponsiveModal } from "@/components/ui/responsive-modal"

const NAV_ITEMS = {
    customer: [
        { name: "Dashboard", href: "/portal/customer", icon: LayoutDashboard },
        { name: "New Request", href: "/quote", icon: Plus },
        { name: "Settings", href: "/portal/settings", icon: Settings },
    ],
    agent: [
        { name: "Sourcing Queue", href: "/portal/agent", icon: PackageSearch },
        { name: "All Orders", href: "/portal/orders", icon: LayoutDashboard },
        { name: "Tools", href: "/portal/tools", icon: Settings },
    ],
    admin: [
        { name: "System Overview", href: "/portal/admin", icon: ShieldAlert },
        { name: "Compliance", href: "/portal/admin/approvals", icon: UserCircle },
        { name: "Shipment Manager", href: "/portal/admin/shipments", icon: PackageSearch },
        { name: "User Management", href: "/portal/users", icon: UserCircle },
        { name: "Revenue", href: "/portal/revenue", icon: LayoutDashboard },
        { name: "Settings", href: "/portal/settings", icon: Settings },
    ]
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { role, setRole } = usePortalStore()
    const [sidebarOpen, setSidebarOpen] = React.useState(true)
    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)

    const currentNav = NAV_ITEMS[role] || NAV_ITEMS.customer

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50",
                sidebarOpen ? "w-64" : "w-18" // Reduced collapsed width slightly to standard 72px or keep 20 (80px) but fix padding
            )}>
                {/* Keep w-20 (80px) for now if used elsewhere, but w-20 is 5rem=80px. */}
                <div className={cn("flex items-center", sidebarOpen ? "p-6 justify-between" : "p-4 justify-center")}>
                    {sidebarOpen ? (
                        <img src="/Hobort auto express logo Main.png" alt="Hobort" className="h-12 w-auto transition-all" />
                    ) : (
                        <div className="h-10 w-10 bg-primary-blue rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0">H</div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-2">
                    {currentNav.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 mx-2 rounded-2xl transition-all duration-300 group",
                                    !sidebarOpen && "justify-center px-2",
                                    isActive
                                        ? "bg-primary-blue text-white shadow-xl shadow-blue-500/20"
                                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400")} />
                                {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{item.name}</span>}
                            </Link>
                        )
                    })}
                </div>

                {/* Logout Button */}
                <div className={cn("border-t border-slate-100 transition-all", sidebarOpen ? "p-4" : "p-2")}>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group",
                            sidebarOpen ? "justify-start gap-4 px-4" : "justify-center px-0"
                        )}
                        onClick={() => setShowLogoutDialog(true)}
                    >
                        <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" />
                        {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            title="Toggle Sidebar"
                            aria-label="Toggle Sidebar"
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="text-lg font-bold text-primary-blue uppercase tracking-tight">{pathname.split('/').pop()}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationDrawer />

                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-primary-blue">Testing User</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{role}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                            <UserCircle className="h-6 w-6 text-slate-300" />
                        </div>
                    </div>
                </header>

                <section className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    {children}
                </section>
            </main>
            <Toaster position="top-right" />
            <SimulationEngine />

            <ResponsiveModal
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
                variant="bottom"
            >
                <div className="flex items-center justify-between gap-6 py-2 w-full px-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0 border border-red-100/50">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col text-left whitespace-nowrap">
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none mb-1">Security</span>
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">Ready to logout?</span>
                        </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        <Button
                            className="h-10 px-6 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all border-none"
                            onClick={() => router.push('/login')}
                        >
                            Confirm
                        </Button>
                        <Button
                            variant="outline"
                            className="h-10 px-6 rounded-full border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all whitespace-nowrap"
                            onClick={() => setShowLogoutDialog(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>
        </div>
    )
}
