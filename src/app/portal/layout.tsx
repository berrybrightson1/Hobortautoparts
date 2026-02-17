"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    Plus,
    Users,
    DollarSign,
    Home,
    ShoppingBag,
    History,
    ShieldAlert,
    Copy,
    FilePlus,
    LayoutDashboard,
    PackageSearch,
    TrendingUp,
    UserCircle,
    Info,
    User,
    Settings,
    LogOut,
    Menu,
    ChevronRight,
    Search,
    Loader2,
    Truck,
    ClipboardList,
    MessageSquare
} from "lucide-react"
import { LiveSupportTrigger } from "@/components/portal/live-support-trigger"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { NotificationPopover } from "@/components/portal/notification-popover"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { TutorialProvider } from "@/components/portal/tutorial-context"
import { PortalTour } from "@/components/portal/portal-tour"

const NAV_ITEMS = {
    customer: [
        { name: "Dashboard", href: "/portal/customer", icon: LayoutDashboard },
        { name: "All Orders", href: "/portal/orders", icon: ShoppingBag },
        { name: "Track Orders", href: "/portal/customer/tracking", icon: Truck },
        { name: "New Request", href: "/quote", icon: Plus },
        { name: "My Account", href: "/portal/profile", icon: UserCircle },
        { name: "Platform Guide", href: "/marketing/guide", icon: Info },
        { name: "Messages", href: "/portal/customer/messages", icon: MessageSquare },
    ],
    agent: [
        { name: "Dashboard", href: "/portal/agent/dashboard", icon: LayoutDashboard },
        { name: "Sourcing Pipeline", href: "/portal/agent", icon: PackageSearch },
        { name: "Order Pipeline", href: "/portal/agent/orders", icon: ShoppingBag },
        { name: "Performance Hub", href: "/portal/agent/performance", icon: TrendingUp },
        { name: "New Request", href: "/quote", icon: FilePlus },
        { name: "My Account", href: "/portal/profile", icon: UserCircle },
        { name: "Messages", href: "/portal/agent/messages", icon: MessageSquare },
        { name: "Platform Guide", href: "/marketing/guide", icon: Info },
    ],
    admin: [
        { name: "Overview", href: "/portal/admin", icon: LayoutDashboard },
        { name: "Orders", href: "/portal/admin/orders", icon: ShoppingBag },
        { name: "Shipments", href: "/portal/admin/shipments", icon: Truck },
        { name: "Sourcing Requests", href: "/portal/admin/requests", icon: PackageSearch },
        { name: "Approvals", href: "/portal/admin/approvals", icon: ShieldAlert },
        { name: "User Network", href: "/portal/users", icon: Users },
        { name: "Live Support", href: "/portal/admin/live-support", icon: MessageSquare },
        { name: "Audit Logs", href: "/portal/admin/audit-logs", icon: ClipboardList },
        { name: "Console & Profile", href: "/portal/profile", icon: Settings },
        { name: "Platform Guide", href: "/portal/admin/guide", icon: Info },
    ]
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, profile, loading, signOut } = useAuth()
    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
    const [unreadCounts, setUnreadCounts] = React.useState<{ [key: string]: number }>({})


    const role = profile?.role || 'customer'

    // Skip layout for admin routes (they have their own layout)
    const isAdminRoute = pathname.startsWith('/portal/admin')

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }

        // Strict Role-Based Path Enforcement
        if (!loading && user && profile) {
            const path = pathname
            const role = profile.role

            if (path.startsWith('/portal/admin') && role !== 'admin') {
                router.push('/portal')
            } else if (path.startsWith('/portal/agent') && role !== 'agent' && role !== 'admin') {
                router.push('/portal/customer')
            } else if (path.startsWith('/portal/customer') && role === 'agent') {
                router.push('/portal/agent')
            }

            // Check for missing phone number and prompt update (DISABLED based on user feedback)
            // if (!profile.phone_number) {
            //     toast.dismiss() // Clean up any previous toasts to avoid clutter
            //     toast.error("Action Required: Phone Number Missing", {
            //         description: "Please update your profile with a valid phone number to continue receiving important updates.",
            //         duration: Infinity, // Persistent until resolved
            //         action: {
            //             label: "Update Now",
            //             onClick: () => router.push('/portal/profile')
            //         },
            //         // Prevent closing without action if possible, though sonner doesn't strictly enforce "un-closable"
            //     })
            // }
        }
    }, [user, profile, loading, router, pathname])

    // Real-time notification tracking for sidebar badges
    React.useEffect(() => {
        if (!user) return

        const fetchUnread = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('type, read')
                .eq('user_id', user.id)
                .eq('read', false)

            if (!error && data) {
                const counts: { [key: string]: number } = {}
                data.forEach((n: any) => {
                    counts[n.type] = (counts[n.type] || 0) + 1
                })
                setUnreadCounts(counts)
            }
        }

        fetchUnread()

        const channel = supabase
            .channel(`layout_notifications:${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchUnread()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="h-10 w-10 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    // If admin route, render children directly (admin has its own layout)
    // If admin route, we no longer skip. We use the unified layout.
    // if (isAdminRoute) {
    //     return <>{children}</>
    // }

    const currentNav = NAV_ITEMS[role as keyof typeof NAV_ITEMS] || NAV_ITEMS.customer

    const handleSignOut = async () => {
        try {
            await signOut()
            toast.success("Logged out successfully", {
                description: "Your session has been securely terminated."
            })
            router.push('/login')
        } catch (error: any) {
            toast.error("Logout Failed", {
                description: error.message
            })
        }
    }

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-slate-100">
                <Link href="/" className="block transition-all hover:scale-105 active:scale-95">
                    <img src="/Hobort auto express logo Main.png" alt="Hobort" className="h-12 w-auto" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {currentNav.map((item: any) => {
                    const isActive = pathname === item.href

                    // Precise badge mapping
                    const isRequestList = item.name === "Sourcing Requests" || item.name === "Sourcing Pipeline"
                    const isOrderList = item.name === "All Orders" || item.name === "Orders" || item.name === "Order Pipeline"
                    const isMessages = item.name === "Messages" || item.name === "Live Support"

                    let unreadCount = 0
                    if (isRequestList) {
                        unreadCount = unreadCounts.request || 0
                    } else if (isOrderList) {
                        unreadCount = unreadCounts.order || 0
                    } else if (isMessages) {
                        // Messages tab shows sum of everything (conversations + status updates)
                        unreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0)
                    }

                    // Tour IDs mapping
                    const tourId = item.name === "Overview" || item.name === "Dashboard" ? "tour-dashboard" :
                        item.name === "Sourcing Requests" ? "tour-requests" :
                            item.name === "Approvals" ? "tour-approvals" :
                                item.name === "Live Support" ? "tour-support" :
                                    item.name === "Sourcing Pipeline" ? "tour-pipeline" :
                                        item.name === "Performance Hub" ? "tour-performance" :
                                            item.name === "New Request" ? "tour-new-request" :
                                                item.name === "All Orders" ? "tour-orders" :
                                                    item.name === "Messages" ? "tour-messages" : undefined

                    if (item.name === "Live Support") {
                        return (
                            <div key={item.href} id={tourId}>
                                <LiveSupportTrigger
                                    href={item.href}
                                    isActive={isActive}
                                    onClick={() => setSidebarOpen(false)}
                                />
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            id={tourId}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-gradient-to-r from-primary-blue to-blue-600 text-white shadow-lg shadow-blue-500/30"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute left-0 w-1 h-6 bg-white rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400")} />
                            <span className="text-sm font-semibold flex-1">{item.name}</span>
                            {unreadCount > 0 && (
                                <span className={cn(
                                    "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ring-2 ring-white shadow-sm",
                                    isActive ? "bg-white text-primary-blue" : "bg-primary-orange text-white"
                                )}>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="border-t border-slate-100 p-4 space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-blue to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider capitalize">{role}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 h-12 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group mt-2"
                    onClick={() => {
                        setSidebarOpen(false)
                        setShowLogoutDialog(true)
                    }}
                >
                    <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-semibold">Logout</span>
                </Button>
            </div>
        </>
    )

    return (
        <TutorialProvider>
            <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-slate-200 shadow-xl">
                    <SidebarContent />
                </aside>

                {/* Mobile Sidebar */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="left" className="w-72 p-0 bg-white">
                        <div className="flex flex-col h-full">
                            <SidebarContent />
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="h-20 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
                                aria-label="Toggle Sidebar"
                                title="Toggle Sidebar"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 capitalize">{role} Portal</h1>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">
                                    {pathname.split('/').pop()?.replace(/-/g, ' ')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationPopover />
                            <Link href="/portal/profile" className="hidden sm:flex items-center gap-3 group hover:bg-slate-50 p-1.5 pr-4 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-blue to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary-blue transition-colors">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black capitalize">{role}</p>
                                </div>
                            </Link>
                        </div>
                    </header>

                    {/* Content Area */}
                    {pathname.startsWith('/portal/admin/live-support') ||
                        pathname.startsWith('/portal/agent/messages') ||
                        pathname.startsWith('/portal/customer/messages') ? (
                        <section className="flex-1 overflow-hidden flex flex-col">
                            {children}
                        </section>
                    ) : (
                        <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                            <div className="max-w-7xl mx-auto">
                                {children}
                            </div>
                        </section>
                    )}
                </main>

                {/* Minimal Logout Confirmation (Bottom-Right) */}
                <AnimatePresence>
                    {showLogoutDialog && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="fixed bottom-6 right-6 z-[100] w-[320px] bg-black border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                                    <LogOut className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">Confirm Sign Out</p>
                                    <p className="text-[10px] font-medium text-slate-400">Securely terminate your active session?</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    className="flex-1 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
                                    onClick={() => setShowLogoutDialog(false)}
                                >
                                    Abort
                                </Button>
                                <Button
                                    className="flex-1 h-9 rounded-lg bg-white hover:bg-slate-200 text-black text-[10px] font-black uppercase tracking-widest transition-all"
                                    onClick={handleSignOut}
                                >
                                    Confirm
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <PortalTour />
            </div>
        </TutorialProvider>
    )
}
