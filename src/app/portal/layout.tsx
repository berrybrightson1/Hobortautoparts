"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  MessageSquare,
  X,
} from "lucide-react";
import { LiveSupportTrigger } from "@/components/portal/live-support-trigger";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { supabase } from "@/lib/supabase";
import { useInvoices } from "@/lib/billing/data/useData";
import { NotificationPopover } from "@/components/portal/notification-popover";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { TutorialProvider } from "@/components/portal/tutorial-context";
import { PortalTour } from "@/components/portal/portal-tour";
import { PendingApprovalModal } from "@/components/portal/pending-approval";
import { AdminRealtimeListener } from "@/components/portal/admin-realtime-listener";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Receipt, HelpCircle, Bug } from "lucide-react";
import { BugReportModal } from "@/components/portal/bug-report-modal";

const NAV_ITEMS = {
  customer: [
    { name: "Dashboard", href: "/portal/customer", icon: LayoutDashboard },
    { name: "All Orders", href: "/portal/orders", icon: ShoppingBag },
    { name: "Track Orders", href: "/portal/customer/tracking", icon: Truck },
    { name: "New Request", href: "/quote?from=portal", icon: Plus },
    {
      name: "Messages",
      href: "/portal/customer/messages",
      icon: MessageSquare,
    },
  ],
  agent: [
    {
      name: "Dashboard",
      href: "/portal/agent/dashboard",
      icon: LayoutDashboard,
    },
    { name: "Sourcing Pipeline", href: "/portal/agent", icon: PackageSearch },
    { name: "Order Pipeline", href: "/portal/agent/orders", icon: ShoppingBag },
    {
      name: "Performance Hub",
      href: "/portal/agent/performance",
      icon: TrendingUp,
    },
    { name: "New Request", href: "/quote?from=portal", icon: FilePlus },
    { name: "Hobort Billing", href: "/portal/billing", icon: Receipt },
    { name: "Messages", href: "/portal/agent/messages", icon: MessageSquare },
  ],
  admin: [
    { name: "Overview", href: "/portal/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/portal/admin/orders", icon: ShoppingBag },
    { name: "Shipments", href: "/portal/admin/shipments", icon: Truck },
    {
      name: "Sourcing Requests",
      href: "/portal/admin/requests",
      icon: PackageSearch,
    },
    { name: "Approvals", href: "/portal/admin/approvals", icon: ShieldAlert },
    { name: "User Network", href: "/portal/users", icon: Users },
    {
      name: "Live Support",
      href: "/portal/admin/live-support",
      icon: MessageSquare,
    },
    {
      name: "Audit Logs",
      href: "/portal/admin/audit-logs",
      icon: ClipboardList,
    },
    { name: "Hobort Billing", href: "/portal/billing", icon: Receipt },
  ],
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [showBugReport, setShowBugReport] = React.useState(false);
  const [unreadCounts, setUnreadCounts] = React.useState<{
    [key: string]: number;
  }>({});
  const [billingPanelOpen, setBillingPanelOpen] = React.useState(false);

  // Billing data for badges
  const { invoices } = useInvoices();
  const unpaidCount = invoices.filter((inv) => inv.status === 'balance_due').length;
  const [sidebarHovered, setSidebarHovered] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [openBugCount, setOpenBugCount] = React.useState(0);
  const [pendingAgentCount, setPendingAgentCount] = React.useState(0);
  const [hidePhoneAlert, setHidePhoneAlert] = React.useState(false);

  // Fetch open bug count for admin badge
  React.useEffect(() => {
    if (profile?.role !== 'admin') return;

    // Fetch Bugs
    supabase
      .from('bug_reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open')
      .then(({ count }) => setOpenBugCount(count ?? 0));

    // Fetch Pending Agents
    const fetchAgents = () => {
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'pending_agent')
        .then(({ count }) => setPendingAgentCount(count ?? 0));
    };

    fetchAgents();

    // Listen to Profiles Table changes for admin roles
    const profilesChannel = supabase
      .channel('admin_profiles_tracker')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchAgents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
    };
  }, [profile?.role]);

  React.useEffect(() => {
    // Auto-open billing panel on load or navigation if we are in the billing section
    if (pathname.startsWith("/portal/billing")) {
      setBillingPanelOpen(true);
    } else {
      setBillingPanelOpen(false); // Close it if we navigate away
    }
  }, [pathname]);

  // Sidebar is collapsed (icon-only) when billing panel is open AND not hovering
  const sidebarCollapsed = billingPanelOpen && !sidebarHovered;

  const role = profile?.role || "customer";

  // Skip layout for admin routes (they have their own layout)
  const isAdminRoute = pathname.startsWith("/portal/admin");

  React.useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push("/login");
    }

    // Strict Role-Based Path Enforcement
    if (!loading && user && profile) {
      const path = pathname;
      const role = profile.role;

      if (path.startsWith("/portal/admin") && role !== "admin") {
        router.push("/portal");
      } else if (
        path.startsWith("/portal/agent") &&
        role !== "agent" &&
        role !== "admin"
      ) {
        router.push("/portal/customer");
      } else if (path.startsWith("/portal/customer") && role === "agent") {
        router.push("/portal/agent");
      } else if (path.startsWith("/portal/billing") && role === "customer") {
        router.push("/portal/customer");
      }

      // Agent Bootcamp routing
      if (role === "agent" && path.startsWith("/portal/agent") && role !== "admin") {
        const hasCompletedBootcamp = user.user_metadata?.onboarding_completed;
        if (!hasCompletedBootcamp && !path.startsWith("/portal/agent/bootcamp")) {
          router.push("/portal/agent/bootcamp");
        } else if (hasCompletedBootcamp && path.startsWith("/portal/agent/bootcamp")) {
          router.push("/portal/agent");
        }
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
  }, [user, profile, loading, router, pathname]);

  // Real-time notification tracking for sidebar badges
  React.useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("type, read")
        .eq("user_id", user.id)
        .eq("read", false);

      if (!error && data) {
        const counts: { [key: string]: number } = {};
        data.forEach((n: any) => {
          counts[n.type] = (counts[n.type] || 0) + 1;
        });
        setUnreadCounts(counts);
      }
    };

    fetchUnread();

    const channel = supabase
      .channel(`layout_notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnread();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!mounted || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="h-10 w-10 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  // If admin route, render children directly (admin has its own layout)
  // If admin route, we no longer skip. We use the unified layout.
  // if (isAdminRoute) {
  //     return <>{children}</>
  // }

  const currentNav =
    NAV_ITEMS[role as keyof typeof NAV_ITEMS] || NAV_ITEMS.customer;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully", {
        description: "Your session has been securely terminated.",
      });
      router.push("/login");
    } catch (error: any) {
      toast.error("Logout Failed", {
        description: error.message,
      });
    }
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Logo — h-20 to match portal header height */}
      <div
        className={cn(
          "h-20 shrink-0 border-b border-slate-100 flex items-center transition-all duration-300",
          collapsed ? "justify-center px-3" : "px-6",
        )}
      >
        <Link
          href="/"
          className="block transition-all hover:scale-105 active:scale-95"
        >
          {collapsed ? (
            <img
              src="/Hobort auto express logo Main.png"
              alt="Hobort"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <img
              src="/Hobort auto express logo Main.png"
              alt="Hobort"
              className="h-12 w-auto"
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto space-y-1",
          collapsed ? "p-2" : "p-4 space-y-2",
        )}
      >
        {currentNav.map((item: any) => {
          const isActive = pathname === item.href;

          const isRequestList =
            item.name === "Sourcing Requests" ||
            item.name === "Sourcing Pipeline";
          const isOrderList =
            item.name === "All Orders" ||
            item.name === "Orders" ||
            item.name === "Order Pipeline";
          const isMessages =
            item.name === "Messages" || item.name === "Live Support";

          let unreadCount = 0;
          if (isRequestList) unreadCount = unreadCounts.request || 0;
          else if (isOrderList) unreadCount = unreadCounts.order || 0;
          else if (isMessages)
            unreadCount = Object.values(unreadCounts).reduce(
              (a, b) => a + b,
              0,
            );

          if (item.name === "Bug Reports") unreadCount = openBugCount;
          if (item.name === "Approvals" || item.name === "User Network") {
            unreadCount = pendingAgentCount;
          }

          const tourId =
            item.name === "Overview" || item.name === "Dashboard"
              ? "tour-dashboard"
              : item.name === "Sourcing Requests"
                ? "tour-requests"
                : item.name === "Approvals"
                  ? "tour-approvals"
                  : item.name === "Live Support"
                    ? "tour-support"
                    : item.name === "Sourcing Pipeline"
                      ? "tour-pipeline"
                      : item.name === "Performance Hub"
                        ? "tour-performance"
                        : item.name === "New Request"
                          ? "tour-new-request"
                          : item.name === "All Orders"
                            ? "tour-orders"
                            : item.name === "Messages"
                              ? "tour-messages"
                              : undefined;

          if (item.name === "Hobort Billing") {
            const isBillingActive = pathname.startsWith("/portal/billing");
            if (collapsed) {
              return (
                <button
                  key={item.href}
                  type="button"
                  title="Hobort Billing"
                  onClick={() => setBillingPanelOpen((o) => !o)}
                  className={cn(
                    "w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200",
                    isBillingActive || billingPanelOpen
                      ? "bg-primary-blue text-white"
                      : "text-slate-400 hover:bg-slate-50 hover:text-primary-blue",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {unpaidCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold bg-primary-orange text-white">
                      {unpaidCount}
                    </span>
                  )}
                </button>
              );
            }
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => setBillingPanelOpen((o) => !o)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                  isBillingActive || billingPanelOpen
                    ? "bg-gradient-to-r from-primary-blue to-[#1b4e6f] text-white shadow-lg shadow-primary-blue/30"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                    isBillingActive || billingPanelOpen
                      ? "text-white"
                      : "text-slate-400",
                  )}
                />
                <span className="text-sm font-semibold flex-1 text-left">
                  {item.name}
                </span>
                {unpaidCount > 0 && (
                  <span className={cn(
                    "flex items-center justify-center min-w-[18px] h-4.5 px-1.5 rounded-full text-[10px] font-bold mr-1",
                    isBillingActive || billingPanelOpen
                      ? "bg-white/20 text-white"
                      : "bg-primary-orange text-white"
                  )}>
                    {unpaidCount}
                  </span>
                )}
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    billingPanelOpen ? "rotate-180" : "",
                    isBillingActive || billingPanelOpen
                      ? "text-white/70"
                      : "text-slate-400",
                  )}
                />
              </button>
            );
          }

          if (item.name === "Live Support") {
            return (
              <div key={item.href} id={tourId}>
                <LiveSupportTrigger
                  href={item.href}
                  isActive={isActive}
                  collapsed={collapsed}
                  onClick={() => setSidebarOpen(false)}
                />
              </div>
            );
          }

          if (collapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  item.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                onClick={() => {
                  if (!item.href.startsWith("http")) setSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center justify-center p-3 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? "bg-primary-blue text-white"
                    : "text-slate-400 hover:bg-slate-50 hover:text-primary-blue",
                )}
              >
                <item.icon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold bg-primary-orange text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              id={tourId}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={
                item.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              onClick={() => {
                if (!item.href.startsWith("http")) setSidebarOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                isActive
                  ? "bg-gradient-to-r from-primary-blue to-[#1b4e6f] text-white shadow-lg shadow-primary-blue/30"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-6 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-400",
                )}
              />
              <span className="text-sm font-semibold flex-1">{item.name}</span>
              {unreadCount > 0 && (
                <span
                  className={cn(
                    "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ring-2 ring-white shadow-sm",
                    isActive
                      ? "bg-white text-primary-blue"
                      : "bg-primary-orange text-white",
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout — h-[72px] matches billing panel footer */}
      <div
        className={cn(
          "h-[72px] shrink-0 flex items-center border-t border-slate-100",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        {collapsed ? (
          // Collapsed: just show avatar + logout icon stacked
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-blue to-[#0f2d40] flex items-center justify-center text-white text-xs shadow-md">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <button
              type="button"
              title="Log out"
              aria-label="Log out"
              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              onClick={() => {
                setSidebarOpen(false);
                setShowLogoutDialog(true);
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : mounted ? (
          <div className="flex items-center group w-full px-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors min-w-0 outline-none">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-primary-blue to-[#0f2d40] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {profile?.email || user?.email || "User"}
                    </p>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide capitalize truncate">
                      {role} plan
                    </p>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-slate-400 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[240px] mb-2 p-2 rounded-xl shadow-xl shadow-slate-200/50 border-slate-200"
                align="end"
                side="top"
                sideOffset={8}
              >
                <div className="px-2 py-1.5 mb-2 border-b border-slate-100/80">
                  <p className="text-xs font-medium text-slate-500 truncate">
                    {profile?.email || user?.email}
                  </p>
                </div>
                <DropdownMenuItem
                  asChild
                  className="rounded-lg cursor-pointer focus:bg-slate-50 text-slate-700"
                >
                  <Link
                    href="/portal/profile"
                    className="flex items-center w-full px-2 py-2"
                  >
                    <Settings className="mr-3 h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">Settings</span>
                    <span className="ml-auto text-[10px] text-slate-400">
                      Ctrl+,
                    </span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="rounded-lg cursor-pointer focus:bg-slate-50 text-slate-700"
                >
                  <Link
                    href={
                      role === "admin"
                        ? "/portal/admin/guide"
                        : "/marketing/guide"
                    }
                    className="flex items-center w-full px-2 py-2"
                  >
                    <HelpCircle className="mr-3 h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">Get help</span>
                  </Link>
                </DropdownMenuItem>
                {role === "admin" ? (
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg cursor-pointer focus:bg-orange-50 text-slate-700"
                  >
                    <Link
                      href="/portal/admin/bug-reports"
                      className="flex items-center w-full px-2 py-2"
                    >
                      <Bug className="mr-3 h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium flex-1">View Bug Reports</span>
                      {openBugCount > 0 && (
                        <span className="ml-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f97316] text-white text-[10px] font-bold flex items-center justify-center">
                          {openBugCount > 99 ? '99+' : openBugCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="rounded-lg cursor-pointer focus:bg-orange-50 focus:text-orange-600 text-slate-700"
                    onClick={() => {
                      setSidebarOpen(false);
                      setShowBugReport(true);
                    }}
                  >
                    <Bug className="mr-3 h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium flex-1">
                      Report a Bug
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer focus:bg-red-50 focus:text-red-600 text-slate-700"
                  onClick={() => {
                    setSidebarOpen(false);
                    setShowLogoutDialog(true);
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center group w-full px-1">
            <div className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl min-w-0">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-primary-blue to-[#0f2d40] flex items-center justify-center text-white font-bold text-sm shadow-md">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0 hidden md:block">
                <div className="h-4 w-24 bg-slate-100 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-12 bg-slate-50 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <TutorialProvider>
      {profile?.role === 'pending_agent' && <PendingApprovalModal />}
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Desktop Sidebar — collapses to icon mode when billing panel is open */}
        <motion.aside
          animate={{ width: sidebarCollapsed ? 64 : 288 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onHoverStart={() => {
            if (billingPanelOpen) setSidebarHovered(true);
          }}
          onHoverEnd={() => setSidebarHovered(false)}
          className="hidden lg:flex flex-col bg-white border-r border-slate-200 shadow-xl relative z-20 overflow-hidden"
          style={{ minWidth: sidebarCollapsed ? 64 : 288 }}
        >
          <SidebarContent collapsed={sidebarCollapsed} />
        </motion.aside>

        {/* Billing Fly-out Panel */}
        <AnimatePresence>
          {billingPanelOpen && (
            <>
              {/* Backdrop for closing */}
              <motion.div
                key="billing-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-10 lg:hidden"
                onClick={() => setBillingPanelOpen(false)}
              />

              <motion.aside
                key="billing-panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 224, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden lg:flex flex-col bg-white border-r border-slate-200 shadow-2xl shadow-slate-300/30 z-10 relative overflow-hidden"
                style={{ minWidth: 0 }}
              >
                {/* Panel Header — h-20 to match portal header height */}
                <div className="h-20 shrink-0 flex items-center justify-between px-5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary-blue to-hobort-blue-dark flex items-center justify-center shadow-md shadow-primary-blue/20">
                      <Receipt className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Hobort Billing
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                        Invoicing
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close billing panel"
                    title="Close billing panel"
                    onClick={() => setBillingPanelOpen(false)}
                    className="h-6 w-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                  </button>
                </div>

                {/* Billing Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                  {[
                    {
                      name: "Dashboard",
                      href: "/portal/billing/dashboard",
                      icon: LayoutDashboard,
                    },
                    {
                      name: "All Invoices",
                      href: "/portal/billing/invoices",
                      icon: ClipboardList,
                    },
                    {
                      name: "Create Invoice",
                      href: "/portal/billing/invoices/create",
                      icon: FilePlus,
                    },
                    {
                      name: "Finance",
                      href: "/portal/billing/finance",
                      icon: DollarSign,
                    },
                    {
                      name: "Settings",
                      href: "/portal/billing/settings",
                      icon: Settings,
                    },
                  ].map((sub) => {
                    const isActive = pathname === sub.href;

                    let badgeCount = 0;
                    if (sub.name === "All Invoices") badgeCount = invoices.length;
                    if (sub.name === "Finance") badgeCount = unpaidCount;

                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group",
                          isActive
                            ? "bg-primary-blue/5 text-primary-blue font-semibold border border-primary-blue/20"
                            : "text-slate-600 hover:bg-slate-50 hover:text-primary-blue",
                        )}
                      >
                        <sub.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive
                              ? "text-primary-blue"
                              : "text-slate-400 group-hover:text-slate-600",
                          )}
                        />
                        <span className="flex-1">{sub.name}</span>
                        {badgeCount > 0 && (
                          <span className={cn(
                            "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold transition-colors",
                            isActive
                              ? "bg-primary-blue text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-primary-blue/10 group-hover:text-primary-blue"
                          )}>
                            {badgeCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Panel Footer — matches sidebar footer height */}
                <div className="h-[72px] shrink-0 flex items-center px-3 border-t border-slate-100">
                  <Link
                    href="/portal/billing/invoices/create"
                    onClick={() => setBillingPanelOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-primary-blue/20 text-primary-blue text-sm hover:bg-primary-blue hover:text-white transition-all duration-200"
                  >
                    <FilePlus className="h-4 w-4" />
                    New Invoice
                  </Link>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

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
                <h1 className="text-xl font-bold text-slate-900 capitalize">
                  {role} Portal
                </h1>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  {pathname.split("/").pop()?.replace(/-/g, " ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationPopover />
              <Link
                href="/portal/profile"
                className="hidden sm:flex items-center gap-3 group hover:bg-slate-50 p-1.5 pr-4 rounded-2xl transition-all border border-transparent hover:border-slate-100"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-blue to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  {profile?.full_name?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "U"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-primary-blue transition-colors">
                    {profile?.full_name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black capitalize">
                    {role}
                  </p>
                </div>
              </Link>
            </div>
          </header>

          {/* Missing Phone Number Alert Banner */}
          {profile && !profile.phone_number && !hidePhoneAlert && (
            <div className="bg-primary-orange/10 border-b border-primary-orange/20 px-6 py-3 flex items-center justify-between shrink-0 shadow-inner">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-primary-orange shrink-0" />
                <p className="text-sm font-medium text-orange-900 leading-tight">
                  <strong className="font-bold">Action Required:</strong> Please update your profile with a valid mobile number so our admins can follow up on your orders.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Button onClick={() => router.push('/portal/profile')} className="h-8 text-xs bg-primary-orange hover:bg-orange-600 text-white font-bold px-4 rounded-xl shadow-md border border-orange-500/20 active:scale-95 transition-all w-full sm:w-auto">Update Now</Button>
                <button onClick={() => setHidePhoneAlert(true)} title="Dismiss Alert" aria-label="Dismiss Alert" className="p-1.5 text-orange-500 hover:bg-orange-500/10 hover:text-orange-700 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
              </div>
            </div>
          )}

          {/* Content Area */}
          {pathname.startsWith("/portal/admin/live-support") ||
            pathname.startsWith("/portal/agent/messages") ||
            pathname.startsWith("/portal/customer/messages") ? (
            <section className="flex-1 overflow-hidden flex flex-col">
              {children}
            </section>
          ) : (
            <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">{children}</div>
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
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Confirm Sign Out
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">
                    Securely terminate your active session?
                  </p>
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

        <BugReportModal open={showBugReport} onClose={() => setShowBugReport(false)} />
        <PortalTour />
        <AdminRealtimeListener />
      </div>
    </TutorialProvider>
  );
}
