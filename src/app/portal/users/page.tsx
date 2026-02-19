"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,

    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Search, Filter, MoreHorizontal, UserPlus, Inbox, ShieldCheck, User as UserIcon, Briefcase, Loader2, Phone, Mail, Calendar, MapPin, BellRing, CheckCircle2, XCircle, Package, Clock, ArrowRight } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"
import { SearchBar } from "@/components/portal/search-bar"
import { Pagination } from "@/components/portal/pagination"
import { updateUserRole, createUser, getUserSourcingHistory, getUsersWithEmails, deleteUser, suspendUser, unsuspendUser, resetUserPassword } from "@/app/actions/admin-actions"
import { SmartPhoneInput } from "@/components/ui/phone-input"

export default function UsersPage() {
    const [activeRole, setActiveRole] = useState<'all' | 'customer' | 'agent' | 'admin'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(20)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Create User State
    const [newUser, setNewUser] = useState({
        full_name: "",
        email: "",
        password: "",
        phone_number: "",
        role: "customer"
    })
    const [isCreating, setIsCreating] = useState(false)

    // Delete User State
    const [userToDelete, setUserToDelete] = useState<any | null>(null)
    const [isDeletingUser, setIsDeletingUser] = useState(false)

    // User Detail View State
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const [isNotifying, setIsNotifying] = useState(false)
    const [sourcingHistory, setSourcingHistory] = useState<any[]>([])
    const [isHistoryLoading, setIsHistoryLoading] = useState(false)

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const result = await getUsersWithEmails()

            if (!result.success) {
                throw new Error(result.error)
            }

            setUsers(result.data || [])
        } catch (error: any) {
            toast.error("Failed to fetch users", {
                description: error.message
            })
        } finally {
            setIsLoading(false)
        }
    }

    const [isResetModalOpen, setIsResetModalOpen] = useState(false)
    const [userToReset, setUserToReset] = useState<any>(null)
    const [newPass, setNewPass] = useState('')
    const [isResetting, setIsResetting] = useState(false)

    const handleResetPassword = async () => {
        if (!newPass) return
        setIsResetting(true)
        try {
            const res = await resetUserPassword(userToReset.id, newPass)
            if (res.success) {
                toast.success("Password reset successful")
                setIsResetModalOpen(false)
                setNewPass('')
            } else {
                toast.error("Reset failed", { description: res.error })
            }
        } catch (error: any) {
            toast.error("Error resetting password")
        } finally {
            setIsResetting(false)
        }
    }

    const handleToggleSuspension = async (user: any) => {
        const isSuspended = user.raw_user_meta_data?.suspended === true
        setUpdatingId(user.id)
        try {
            const res = isSuspended ? await unsuspendUser(user.id) : await suspendUser(user.id)
            if (res.success) {
                toast.success(isSuspended ? "Account reactivated" : "Account suspended")
                fetchUsers()
            } else {
                toast.error("Action failed", { description: res.error })
            }
        } catch (error: any) {
            toast.error("Error updating suspension status")
        } finally {
            setUpdatingId(null)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.full_name) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsCreating(true)
        try {
            const result = await createUser(newUser)

            if (!result.success) {
                throw new Error(result.error)
            }

            toast.success("User created successfully", {
                description: `${newUser.full_name} has been added to the system.`
            })

            setIsCreateModalOpen(false)
            setNewUser({ full_name: "", email: "", password: "", phone_number: "", role: "customer" })
            fetchUsers() // Refresh list
        } catch (error: any) {
            toast.error("Creation failed", {
                description: error.message
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: any) => {
        setUpdatingId(userId)
        try {
            const result = await updateUserRole(userId, newRole)

            if (!result.success) throw new Error(result.error)

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
            toast.success("Role updated", {
                description: `User is now a ${newRole}.`
            })
        } catch (error: any) {
            toast.error("Update failed", {
                description: error.message
            })
        } finally {
            setUpdatingId(null)
        }
    }

    const fetchUserHistory = async (userId: string) => {
        setIsHistoryLoading(true)
        setSourcingHistory([])
        try {
            const result = await getUserSourcingHistory(userId)

            if (!result.success) throw new Error(result.error)

            setSourcingHistory(result.data || [])
        } catch (error: any) {
            console.error("Error fetching history:", error)
            toast.error("Failed to load history")
        } finally {
            setIsHistoryLoading(false)
        }
    }



    const handleNotify = async (user: any) => {
        setIsNotifying(true)
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: user.id,
                    title: "Action Required: Update Contact Info",
                    message: "Admin requires your phone number for account verification used for shipping updates.",
                    type: 'system',
                    read: false
                })

            if (error) throw error

            toast.success("Notification Sent", {
                description: `Alert delivered to ${user.full_name}.`
            })
        } catch (error: any) {
            toast.error("Failed to notify", {
                description: error.message
            })
        } finally {
            setIsNotifying(false)
        }
    }

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(1) // Reset to first page on new search
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const filteredUsers = users.filter((user: any) => {
        const matchesRole = activeRole === 'all' || user.role === activeRole
        const name = user.full_name || 'Anonymous'
        const matchesSearch = !debouncedSearch ||
            name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            user.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            user.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            user.phone_number?.toLowerCase().includes(debouncedSearch.toLowerCase())
        return matchesRole && matchesSearch
    })

    const totalPages = Math.ceil(filteredUsers.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)


    const counts = {
        all: users.length,
        customer: users.filter(u => u.role === 'customer').length,
        agent: users.filter(u => u.role === 'agent').length,
        admin: users.filter(u => u.role === 'admin').length
    }

    const roles = [
        { id: 'all', label: `All Users (${counts.all})` },
        { id: 'customer', label: `Customers (${counts.customer})` },
        { id: 'agent', label: `Agents (${counts.agent})` },
        { id: 'admin', label: `Admins (${counts.admin})` }
    ]

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-primary-blue/5 flex items-center justify-center text-primary-blue shrink-0">
                            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tighter text-slate-900 uppercase leading-none">User Network</h2>
                    </div>
                    <p className="text-slate-500 font-medium text-base sm:text-lg pt-2">Governance and account management for the Hobort ecosystem.</p>
                </div>

                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 w-full sm:w-auto px-6 rounded-xl bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/10 transition-all font-medium text-sm group">
                            <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" /> Create User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 shadow-2xl bg-white gap-0 rounded-3xl">
                        <DialogHeader className="p-6 pb-2 text-left bg-white">
                            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Create User</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium text-sm">Add a new user to the portal.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 pt-2 space-y-4 bg-white">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 ml-1">Full Name</Label>
                                <Input
                                    placeholder="John Doe"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                    value={newUser.full_name}
                                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 ml-1">Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 ml-1">Phone Number</Label>
                                <SmartPhoneInput
                                    value={newUser.phone_number}
                                    onChange={(val) => setNewUser({ ...newUser, phone_number: val })}
                                    className="h-11"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 ml-1">Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 ml-1">Role</Label>
                                    <Select
                                        value={newUser.role}
                                        onValueChange={(v: any) => setNewUser({ ...newUser, role: v })}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white font-medium">
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 shadow-xl bg-white">
                                            <SelectItem value="customer">Customer</SelectItem>
                                            <SelectItem value="agent">Agent</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-6 pt-2 bg-white flex-none">
                            <Button
                                onClick={handleCreateUser}
                                disabled={isCreating}
                                className="h-12 w-full rounded-xl bg-slate-900 hover:bg-black font-semibold text-white shadow-lg disabled:opacity-50"
                            >
                                {isCreating ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <UserPlus className="h-5 w-5 mr-2" />}
                                Create Account
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Premium Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white p-2 sm:p-4 rounded-[1.5rem] sm:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="lg:col-span-6 flex p-1.5 bg-slate-50 rounded-[1.25rem] sm:rounded-[2rem] relative gap-1 overflow-x-auto no-scrollbar">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setActiveRole(role.id as any)}
                            className={cn(
                                "flex-1 py-2.5 sm:py-3 px-3 sm:px-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all duration-500 relative z-10 whitespace-nowrap min-w-[80px]",
                                activeRole === role.id ? "text-white" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {role.label}
                        </button>
                    ))}
                    {/* Animated Glider */}
                    <div
                        className={cn(
                            "absolute top-1.5 bottom-1.5 bg-primary-blue rounded-full transition-all duration-500 shadow-lg shadow-blue-500/20 hidden sm:block",
                            activeRole === 'all' ? "left-[0.5rem] w-[calc(25%-0.6rem)]" :
                                activeRole === 'customer' ? "left-[25%] w-[calc(25%-0.6rem)]" :
                                    activeRole === 'agent' ? "left-[50.1%] w-[calc(25%-0.6rem)]" : "left-[75.3%] w-[calc(25%-0.6rem)]"
                        )}
                    />
                </div>

                <div className="lg:col-span-6">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by name, ID, email, or phone..."
                        className="h-14 rounded-[2rem] bg-white ring-1 ring-slate-100 shadow-sm"
                    />
                </div>
            </div>

            {/* List View */}
            <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white ring-1 ring-slate-100/50">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent border-slate-50">
                                    <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider pl-10 h-16">User</TableHead>
                                    <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider h-16">Role</TableHead>
                                    <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider h-16">Joined</TableHead>
                                    <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-wider h-16 text-right pr-10">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="h-8 w-8 text-primary-blue animate-spin" />
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Users...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="hover:bg-slate-50/80 transition-all border-slate-50 group cursor-pointer"
                                            onClick={() => {
                                                setSelectedUser(user)
                                                setIsSheetOpen(true)
                                                fetchUserHistory(user.id)
                                            }}
                                        >
                                            <TableCell className="pl-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all shrink-0 overflow-hidden">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="h-6 w-6" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-slate-900 leading-tight truncate">{user.full_name || 'Unnamed User'}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5 truncate">{user.id}</span>
                                                        {user.raw_user_meta_data?.suspended && (
                                                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1 animate-pulse">Suspended</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider border-0 shadow-sm",
                                                    user.role === 'admin' ? "bg-red-50 text-red-600" :
                                                        user.role === 'agent' ? "bg-blue-50 text-blue-600" :
                                                            "bg-slate-100 text-slate-500"
                                                )}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-slate-700">{format(new Date(user.created_at), 'MMM dd, yyyy • h:mm a')}</span>
                                                    <span className="text-[9px] font-medium text-slate-400">{user.country || 'Global Origin'}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right pr-10" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100" disabled={updatingId === user.id}>
                                                            {updatingId === user.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                                                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">Elevate Role</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-slate-50" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleRoleChange(user.id, 'admin')}
                                                            className="rounded-xl font-bold text-xs px-3 py-2.5 cursor-pointer hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <ShieldCheck className="mr-2 h-4 w-4" /> Master Admin
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleRoleChange(user.id, 'agent')}
                                                            className="rounded-xl font-bold text-xs px-3 py-2.5 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                                                        >
                                                            <Briefcase className="mr-2 h-4 w-4" /> Regional Partner
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleRoleChange(user.id, 'customer')}
                                                            className="rounded-xl font-bold text-xs px-3 py-2.5 cursor-pointer"
                                                        >
                                                            <UserIcon className="mr-2 h-4 w-4" /> Standard Customer
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-50" />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setUserToReset(user)
                                                                setIsResetModalOpen(true)
                                                            }}
                                                            className="rounded-xl font-bold text-xs px-3 py-2.5 cursor-pointer"
                                                        >
                                                            Reset Password
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleSuspension(user)}
                                                            className={cn(
                                                                "rounded-xl font-bold text-xs px-3 py-2.5 cursor-pointer",
                                                                user.raw_user_meta_data?.suspended ? "text-emerald-600 hover:bg-emerald-50" : "text-orange-600 hover:bg-orange-50"
                                                            )}
                                                        >
                                                            {user.raw_user_meta_data?.suspended ? "Reactivate User" : "Suspend Access"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setUserToDelete(user)}
                                                            className="rounded-xl font-bold text-xs px-3 py-2.5 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
                                                        >
                                                            Delete Account
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-inner">
                                                    <Inbox className="h-10 w-10" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xl font-bold text-slate-900 leading-none">No Users Found</p>
                                                    <p className="text-sm text-slate-500 font-medium">New users will appear here once registered.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredUsers.length > pageSize && (
                        <div className="p-6 border-t border-slate-50 bg-white">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalCount={filteredUsers.length}
                                pageSize={pageSize}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Search Empty State */}
            {filteredUsers.length === 0 && debouncedSearch !== '' && !isLoading && (
                <div className="h-96 flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-dashed border-slate-200 space-y-6">
                    <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                        <Search className="h-10 w-10 text-slate-200" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xl font-bold text-slate-900">No users found</p>
                        <p className="text-sm font-medium text-slate-400 max-w-[300px]">Adjust your filters or try searching for a different name.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => { setActiveRole('all'); setSearchQuery('') }}
                        className="rounded-full h-12 px-8 border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        Reset All Filters
                    </Button>
                </div>
            )}


            {/* User Details Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:w-[400px] p-0 border-l border-slate-100 shadow-2xl overflow-hidden bg-white sm:rounded-l-[2.5rem]">
                    <SheetHeader className="sr-only">
                        <SheetTitle>User Details</SheetTitle>
                    </SheetHeader>
                    {selectedUser && (
                        <div className="flex flex-col h-full bg-white">
                            {/* Minimal Header */}
                            <div className="px-6 pt-10 pb-6 border-b border-slate-50 flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="h-16 w-16 rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100 overflow-hidden shrink-0">
                                        {selectedUser.avatar_url ? (
                                            <img src={selectedUser.avatar_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-8 w-8" />
                                        )}
                                    </div>
                                    <Badge className={cn(
                                        "rounded-lg px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider border-0 shadow-sm self-start",
                                        selectedUser.role === 'admin' ? "bg-red-50 text-red-600" :
                                            selectedUser.role === 'agent' ? "bg-blue-50 text-blue-600" :
                                                "bg-slate-100 text-slate-500"
                                    )}>
                                        {selectedUser.role}
                                    </Badge>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedUser.full_name || 'Unnamed User'}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-100">
                                            <MapPin className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{selectedUser.country || 'Global'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-100">
                                            <Calendar className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Joined {format(new Date(selectedUser.created_at), 'MMM yyyy')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Contact Section */}
                                <div className="space-y-3">
                                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Contact Info</h3>
                                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                                        <div className="flex items-center gap-3 p-3 border-b border-slate-100">
                                            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                                                <p className="text-xs font-bold text-slate-900 truncate">{selectedUser.email || 'N/A'}</p>
                                            </div>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-50" />
                                        </div>
                                        <div className="flex items-center gap-3 p-3">
                                            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile</p>
                                                <p className={cn("text-xs font-bold truncate", !selectedUser.phone_number ? "text-red-500" : "text-slate-900")}>
                                                    {selectedUser.phone_number || 'Missing verification'}
                                                </p>
                                            </div>
                                            {selectedUser.phone_number ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-50" />
                                            ) : (
                                                <button
                                                    onClick={() => handleNotify(selectedUser)}
                                                    className="bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                                                    disabled={isNotifying}
                                                >
                                                    {isNotifying ? <Loader2 className="h-4 w-4 animate-spin text-red-600" /> : <BellRing className="h-4 w-4 text-red-600" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sourcing History Section */}
                                <div className="space-y-3">
                                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Recent Activity</h3>
                                    <div className="space-y-2">
                                        {isHistoryLoading ? (
                                            <div className="h-20 rounded-2xl bg-slate-50 animate-pulse" />
                                        ) : sourcingHistory.length > 0 ? (
                                            sourcingHistory.map((item) => (
                                                <div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                    <div className="mt-1 h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <p className="text-xs font-bold text-slate-900 line-clamp-2">{item.part_name}</p>
                                                            <span className={cn(
                                                                "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0",
                                                                item.status === 'completed' ? "bg-emerald-50 text-emerald-700" :
                                                                    item.status === 'processing' ? "bg-blue-50 text-blue-700" :
                                                                        "bg-slate-100 text-slate-500"
                                                            )}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{format(new Date(item.created_at), 'MMM dd')} • {item.vehicle_info || 'Unknown Vehicle'}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider opacity-60">No History</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-50 bg-slate-50/50">
                                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">User ID: {selectedUser.id.substring(0, 8)}...</p>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Password Reset Dialog */}
            <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl bg-white p-0 gap-0 overflow-hidden">
                    <div className="p-8 sm:p-10 space-y-6">
                        <div className="space-y-2 text-center">
                            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">
                                Manually override password for <strong>{userToReset?.full_name}</strong>.
                            </DialogDescription>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 ml-1">New Password</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter new strong password"
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                disabled={isResetting || !newPass}
                                onClick={handleResetPassword}
                                className="h-14 rounded-2xl font-bold bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/20 transition-all active:scale-95"
                            >
                                {isResetting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Credentials"}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsResetModalOpen(false)}
                                className="h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl bg-white p-0 gap-0 overflow-hidden">
                    <div className="p-8 sm:p-10 text-center space-y-6">
                        <div className="mx-auto h-20 w-20 rounded-[2rem] bg-red-50 flex items-center justify-center text-red-600 shadow-inner border border-red-100">
                            <XCircle className="h-10 w-10" />
                        </div>

                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Delete User Account</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">
                                Are you sure you want to delete <strong>{userToDelete?.full_name}</strong>? This action is <strong>irreversible</strong> and will be blocked if active orders exist.
                            </DialogDescription>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                variant="destructive"
                                disabled={isDeletingUser}
                                onClick={async () => {
                                    if (!userToDelete) return
                                    setIsDeletingUser(true)
                                    try {
                                        const res = await deleteUser(userToDelete.id)
                                        if (res.success) {
                                            toast.success("User deleted successfully")
                                            fetchUsers()
                                            setUserToDelete(null)
                                        } else {
                                            toast.error("Deletion Failed", { description: res.error })
                                        }
                                    } catch (error: any) {
                                        toast.error("Deletion Failed", { description: error.message })
                                    } finally {
                                        setIsDeletingUser(false)
                                    }
                                }}
                                className="h-14 rounded-2xl font-bold bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all active:scale-95"
                            >
                                {isDeletingUser ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Permanent Deletion"}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setUserToDelete(null)}
                                className="h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                            >
                                Discard & Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
