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
import { cn } from "@/lib/utils"
import { Search, Filter, MoreHorizontal, UserPlus, Inbox, ShieldCheck, User as UserIcon, Briefcase, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"

export default function UsersPage() {
    const [activeRole, setActiveRole] = useState<'all' | 'customer' | 'agent' | 'admin'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Create User State
    const [newUser, setNewUser] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "customer"
    })
    const [isCreating, setIsCreating] = useState(false)

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error: any) {
            toast.error("Failed to fetch users", {
                description: error.message
            })
        } finally {
            setIsLoading(false)
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
            // Use supabaseAdmin to sign up without logging out current admin
            const { data, error: signUpError } = await supabaseAdmin.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        full_name: newUser.full_name,
                        role: newUser.role
                    }
                }
            })

            if (signUpError) throw signUpError

            toast.success("Identity created successfully", {
                description: `Authorized entry established for ${newUser.full_name}.`
            })

            setIsCreateModalOpen(false)
            setNewUser({ full_name: "", email: "", password: "", role: "customer" })
            fetchUsers() // Refresh list
        } catch (error: any) {
            toast.error("Creation failed", {
                description: error.message
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingId(userId)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

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

    const filteredUsers = users.filter(user => {
        const matchesRole = activeRole === 'all' || user.role === activeRole
        const name = user.full_name || 'Anonymous'
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.id.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesRole && matchesSearch
    })

    const roles = [
        { id: 'all', label: 'All Users' },
        { id: 'customer', label: 'Customers' },
        { id: 'agent', label: 'Agents' },
        { id: 'admin', label: 'Admins' }
    ]

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary-blue/5 flex items-center justify-center text-primary-blue">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h2 className="text-4xl font-semibold tracking-tighter text-slate-900 uppercase leading-none">User Network</h2>
                    </div>
                    <p className="text-slate-500 font-medium text-lg pt-2">Governance and account management for the Hobort ecosystem.</p>
                </div>

                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 rounded-[2rem] bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/10 transition-all font-semibold uppercase tracking-widest text-xs group">
                            <UserPlus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" /> Create New Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-0 overflow-hidden border-0 shadow-2xl">
                        <DialogHeader className="p-8 pt-10 bg-slate-50/50">
                            <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Create Entity</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">Provision new credentials for the portal ecosystem.</DialogDescription>
                        </DialogHeader>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Legal Name</Label>
                                <Input
                                    placeholder="John Doe"
                                    className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                    value={newUser.full_name}
                                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Secure Email</Label>
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</Label>
                                    <Input
                                        type="password"
                                        className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newUserRole" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Security Class (Role)</Label>
                                    <select
                                        id="newUserRole"
                                        title="Select Security Class"
                                        className="w-full h-14 px-4 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm outline-none"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="agent">Agent</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-8 bg-slate-50/50 flex justify-end">
                            <Button
                                onClick={handleCreateUser}
                                disabled={isCreating}
                                className="h-14 px-10 rounded-2xl bg-primary-blue hover:bg-blue-700 shadow-xl shadow-blue-500/20 font-black gap-3 transition-all active:scale-95 text-white"
                            >
                                {isCreating ? <Loader2 className="animate-spin h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                                Authorize Entry
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Premium Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white p-4 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
                <div className="lg:col-span-6 flex p-2 bg-slate-50 rounded-[2rem] relative gap-1">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setActiveRole(role.id as any)}
                            className={cn(
                                "flex-1 py-3 px-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 relative z-10",
                                activeRole === role.id ? "text-white" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {role.label}
                        </button>
                    ))}
                    {/* Animated Glider */}
                    <div
                        className="absolute top-2 bottom-2 bg-primary-blue rounded-full transition-all duration-500 shadow-lg shadow-blue-500/20"
                        style={{
                            left: activeRole === 'all' ? '0.5rem' :
                                activeRole === 'customer' ? '25%' :
                                    activeRole === 'agent' ? '50.1%' : '75.3%',
                            width: 'calc(25% - 0.6rem)',
                            marginLeft: activeRole === 'all' ? '0' : '0'
                        }}
                    />
                </div>

                <div className="lg:col-span-6 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                    <Input
                        placeholder="Search by name, ID, or digitial signature..."
                        className="h-14 pl-14 pr-6 rounded-[2rem] border-0 bg-white ring-1 ring-slate-100 focus-visible:ring-primary-blue/30 text-sm font-semibold shadow-sm transition-all placeholder:text-slate-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                                    <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-[0.2em] pl-10 h-16">Entity Instance</TableHead>
                                    <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-[0.2em] h-16">Security Class</TableHead>
                                    <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-[0.2em] h-16">Joined</TableHead>
                                    <TableHead className="font-semibold text-slate-400 text-xs uppercase tracking-[0.2em] h-16 text-right pr-10">Ops</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="h-8 w-8 text-primary-blue animate-spin" />
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hydrating User Network...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-slate-50/50 transition-all border-slate-50 group cursor-default">
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
                                                        <span className="font-bold text-slate-900 leading-tight truncate">{user.full_name || 'Incognito Entity'}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5 truncate">{user.id}</span>
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
                                                    <span className="text-[11px] font-bold text-slate-700">{format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                                                    <span className="text-[9px] font-medium text-slate-400">{user.country || 'Global Origin'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-10">
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
                                                        <DropdownMenuItem className="rounded-xl font-bold text-xs px-3 py-2.5 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50">
                                                            Suspend Account
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
                                                    <p className="text-xl font-bold text-slate-900 leading-none">Identity Database Empty</p>
                                                    <p className="text-sm text-slate-500 font-medium">New entities will appear here after synchronization.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Search Empty State */}
            {filteredUsers.length === 0 && searchQuery !== '' && !isLoading && (
                <div className="h-96 flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-dashed border-slate-200 space-y-6">
                    <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                        <Search className="h-10 w-10 text-slate-200" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xl font-bold text-slate-900">No entities identified</p>
                        <p className="text-sm font-medium text-slate-400 max-w-[300px]">Adjust your filters or try searching for a different identifier hash.</p>
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
        </div>
    )
}
