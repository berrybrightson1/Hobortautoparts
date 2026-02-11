"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Search, Filter, MoreHorizontal, UserPlus } from "lucide-react"
import { DEMO_USERS } from "@/lib/demo-data"

import { useState } from "react"

export default function UsersPage() {
    const [activeRole, setActiveRole] = useState<'all' | 'Customer' | 'Agent'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredUsers = DEMO_USERS.filter(user => {
        const matchesRole = activeRole === 'all' || user.role === activeRole
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesRole && matchesSearch
    })

    const roles = [
        { id: 'all', label: 'All Users' },
        { id: 'Customer', label: 'Customers' },
        { id: 'Agent', label: 'Agents' }
    ]

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">User Network</h2>
                    <p className="text-slate-500 font-medium text-lg">Governance and account management for the Hobort ecosystem.</p>
                </div>
                <Button className="h-14 px-8 rounded-[2rem] bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/10 transition-all font-black uppercase tracking-widest text-xs group">
                    <UserPlus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" /> Create New Account
                </Button>
            </div>

            {/* Premium Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white p-4 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
                <div className="lg:col-span-5 flex p-2 bg-slate-50 rounded-[2rem] relative">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setActiveRole(role.id as any)}
                            className={cn(
                                "flex-1 py-3 px-6 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 relative z-10",
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
                            left: activeRole === 'all' ? '0.5rem' : activeRole === 'Customer' ? '33.33%' : '66.66%',
                            width: 'calc(33.33% - 0.66rem)',
                            marginLeft: activeRole === 'all' ? '0' : activeRole === 'Customer' ? '0.15rem' : '0.3rem'
                        }}
                    />
                </div>

                <div className="lg:col-span-1 flex justify-center py-2 h-8">
                    <div className="w-[1px] h-full bg-slate-100 hidden lg:block" />
                </div>

                <div className="lg:col-span-6 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                    <Input
                        placeholder="Search by name, email, or digital ID..."
                        className="h-14 pl-14 pr-6 rounded-[2rem] border-0 bg-white ring-1 ring-slate-100 focus-visible:ring-primary-blue/30 text-sm font-bold shadow-sm transition-all placeholder:text-slate-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <kbd className="h-6 px-2 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-300 flex items-center shadow-sm">
                            / FOR QUICK FIND
                        </kbd>
                    </div>
                </div>
            </div>

            {/* List View */}
            <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white ring-1 ring-slate-100/50">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent border-slate-50">
                                    <TableHead className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] pl-10 h-16">Entity Instance</TableHead>
                                    <TableHead className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] h-16">Security Class</TableHead>
                                    <TableHead className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] h-16">Lifecycle</TableHead>
                                    <TableHead className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] h-16 text-right">Economic Activity</TableHead>
                                    <TableHead className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] h-16 text-right pr-10">Ops</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/50 transition-all border-slate-50 group cursor-default">
                                        <TableCell className="pl-10 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-50 to-white flex items-center justify-center text-slate-400 font-bold text-sm shrink-0 border border-slate-100 shadow-sm relative group-hover:scale-105 transition-transform duration-500">
                                                    {user.avatar}
                                                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-base tracking-tight">{user.name}</p>
                                                    <p className="text-xs text-slate-400 font-black uppercase tracking-wider mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <span className={cn(
                                                "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                user.role === 'Agent'
                                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                                    : user.role === 'Admin'
                                                        ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                                                        : "bg-slate-50 text-slate-600 border-slate-200"
                                            )}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <Badge variant="secondary" className={cn(
                                                "capitalize font-black text-[10px] uppercase tracking-widest border-0 px-3 py-1 shadow-none rounded-lg",
                                                user.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-600"
                                            )}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-6">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-base font-black text-slate-900 tracking-tight">{user.spent}</span>
                                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] bg-slate-50 px-2 py-0.5 rounded-md">Last Op: {user.lastActive}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-10 py-6">
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 text-slate-300 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100">
                                                <MoreHorizontal className="h-6 w-6" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
                <div className="h-96 flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-dashed border-slate-200 space-y-6">
                    <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                        <Search className="h-10 w-10 text-slate-200" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xl font-black text-slate-900">No entities found</p>
                        <p className="text-sm font-medium text-slate-400 max-w-[300px]">Adjust your filters or try searching for a different identifier.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => { setActiveRole('all'); setSearchQuery('') }}
                        className="rounded-full h-12 px-8 border-slate-200 text-xs font-black uppercase tracking-widest"
                    >
                        Reset All Filters
                    </Button>
                </div>
            )}
        </div>
    )
}
