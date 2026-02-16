"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { User, Shield, Key, Loader2, Save, Unlock, Moon, Minimize2, Bell, Mail, Settings2, Globe, Server, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function UnifiedSettingsPage() {
    const { user, profile, refreshProfile } = useAuth()
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
    const [isLoadingPrefs, setIsLoadingPrefs] = useState(true)

    // Profile State
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")

    // Deletion State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    // Security State
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    })

    // Preferences State
    const [prefs, setPrefs] = useState({
        dark_mode: false,
        compact_mode: false,
        email_notifications: true
    })

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "")
            setPhoneNumber(profile.phone_number || "")
            fetchPreferences()
        }
    }, [profile])

    async function fetchPreferences() {
        if (!user) return
        try {
            const { data } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single()
            if (data) {
                setPrefs(data)
                // Apply on load
                if (data.dark_mode) document.documentElement.classList.add('dark')
                if (data.compact_mode) document.documentElement.classList.add('compact-mode')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoadingPrefs(false)
        }
    }

    const handleUpdateProfile = async () => {
        if (!user) return
        setIsSavingProfile(true)
        setIsSaved(false)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName, phone_number: phoneNumber })
                .eq('id', user.id)
            if (error) throw error

            await refreshProfile() // Update global context immediately so "Missing Phone" toast vanishes
            toast.success("Profile details updated")

            setIsSaved(true)
            setTimeout(() => setIsSaved(false), 3000)

        } catch (error: any) {
            toast.error("Update failed", { description: error.message })
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (!passwords.current || !passwords.new) {
            toast.error("Please fill in current and new passwords")
            return
        }
        if (passwords.new !== passwords.confirm) {
            toast.error("Passwords do not match")
            return
        }

        setIsUpdatingPassword(true)
        try {
            // Re-authenticate to verify old password
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: passwords.current,
            })

            if (loginError) {
                throw new Error("Invalid current password. Please try again.")
            }

            // Update to new password
            const { error } = await supabase.auth.updateUser({ password: passwords.new })
            if (error) throw error

            toast.success("Security credentials updated")
            setPasswords({ current: "", new: "", confirm: "" })
        } catch (error: any) {
            toast.error("Security Update Failed", { description: error.message })
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    const togglePref = async (key: string, val: boolean) => {
        if (!user) return
        setPrefs({ ...prefs, [key]: val })

        // Apply class to document element for immediate feedback
        if (key === 'dark_mode') {
            if (val) document.documentElement.classList.add('dark')
            else document.documentElement.classList.remove('dark')
        }
        if (key === 'compact_mode') {
            if (val) document.documentElement.classList.add('compact-mode')
            else document.documentElement.classList.remove('compact-mode')
        }

        try {
            await supabase.from('user_preferences').upsert({
                user_id: user.id,
                [key]: val,
                updated_at: new Date().toISOString()
            })
            toast.success("Preference synchronized", {
                description: "Settings are now consistent across all your devices."
            })
        } catch (e) {
            toast.error("Sync failed")
        }
    }

    if (isLoadingPrefs) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500/20" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Initializing Hub...</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
                    {profile?.role === 'admin' ? 'Console & Profile' : 'Account & Settings'}
                </h2>
                <p className="text-slate-500 font-normal text-base sm:text-lg">Manage your personal profile, portal settings, and security preferences.</p>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="flex w-full overflow-x-auto justify-start mb-8 h-14 bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/50 shadow-inner no-scrollbar">
                    <TabsTrigger value="account" className="rounded-xl px-4 sm:px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary-blue font-semibold transition-all shrink-0">Account</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl px-4 sm:px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary-blue font-semibold transition-all shrink-0">Security</TabsTrigger>
                    <TabsTrigger value="hub" className="rounded-xl px-4 sm:px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary-blue font-semibold transition-all shrink-0">Portal Hub</TabsTrigger>
                    {profile?.role === 'admin' && (
                        <TabsTrigger value="system" className="rounded-xl px-4 sm:px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-orange-600 font-semibold transition-all shrink-0 gap-2">
                            <Server className="h-4 w-4" /> System
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="account">
                    <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                        <CardHeader className="p-6 sm:p-10 pb-4 sm:pb-6 border-b border-slate-50">
                            <CardTitle className="text-xl sm:text-2xl font-semibold text-slate-900">Profile Details</CardTitle>
                            <CardDescription className="text-slate-500 text-sm sm:text-base">Your official platform representation and core contact data.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-10 space-y-8 sm:space-y-10">
                            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-primary-blue to-blue-600 flex items-center justify-center text-white border-4 border-white shadow-2xl transition-transform group-hover:scale-105 duration-500 shrink-0">
                                    <User className="h-10 w-10 sm:h-12 sm:w-12" />
                                </div>
                                <div className="space-y-2 relative z-10 text-center sm:text-left">
                                    <h4 className="font-semibold text-lg sm:text-xl text-slate-900">User Profile</h4>
                                    <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-sm leading-relaxed">Your profile is linked to your email address. Updates are synchronized across the portal for: <span className="text-primary-blue break-all">{user?.email}</span></p>
                                </div>
                                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 ml-1">Full Legal Name</Label>
                                    <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-lg text-slate-900" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 ml-1">Verified Mobile</Label>
                                    <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-lg text-slate-900" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/80 p-6 sm:p-10 flex justify-end">
                            <Button onClick={handleUpdateProfile} disabled={isSavingProfile || isSaved} className={cn(
                                "h-12 sm:h-14 w-full sm:w-auto px-10 rounded-xl sm:rounded-2xl shadow-xl font-bold gap-3 transition-all active:scale-95 text-xs sm:text-base",
                                isSaved ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white" : "bg-primary-blue hover:bg-blue-700 shadow-blue-500/20"
                            )}>
                                {isSavingProfile ? <Loader2 className="animate-spin h-5 w-5" /> :
                                    isSaved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                                {isSaved ? "Saved Successfully" : "Update Profile"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                        <CardHeader className="p-6 sm:p-10 pb-4 sm:pb-6 border-b border-slate-50">
                            <CardTitle className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-3">
                                <Shield className="h-6 w-6 text-emerald-500" /> Security Protocol
                            </CardTitle>
                            <CardDescription className="text-slate-500 text-sm sm:text-base">Old password verification required for all credential shifts.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 ml-1">Verified Current Password</Label>
                                <Input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white font-semibold text-slate-900" placeholder="Required to authorize changes" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-4">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 ml-1">New Secure Cipher</Label>
                                    <Input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white font-semibold text-slate-900" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm Cipher</Label>
                                    <Input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white font-semibold text-slate-900" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/80 p-6 sm:p-10 flex justify-end">
                            <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="h-12 sm:h-14 w-full sm:w-auto px-10 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-black shadow-xl shadow-black/20 font-bold gap-3 transition-all active:scale-95 text-xs sm:text-base">
                                {isUpdatingPassword ? <Loader2 className="animate-spin h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                                Authorize & Update
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-red-100 shadow-2xl shadow-red-200/20 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl mt-8">
                        <CardHeader className="p-6 sm:p-10 pb-4 sm:pb-6 border-b border-red-50">
                            <CardTitle className="text-xl sm:text-2xl font-semibold text-red-600 flex items-center gap-3">
                                <Shield className="h-6 w-6 text-red-500" /> Danger Zone
                            </CardTitle>
                            <CardDescription className="text-red-400 text-sm sm:text-base">Irreversible account actions.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-10">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-slate-900">Delete Account</h4>
                                    <p className="text-sm text-slate-500 max-w-md">Once you delete your account, there is no going back. Please be certain. Accounts with active orders cannot be deleted.</p>
                                </div>
                                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            className="h-12 w-full sm:w-auto px-8 rounded-xl font-bold bg-red-600 hover:bg-red-700"
                                        >
                                            Delete Account
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md rounded-[2rem] border-0 shadow-2xl bg-white p-0 gap-0 overflow-hidden">
                                        <DialogHeader className="p-8 pb-4">
                                            <DialogTitle className="text-xl font-bold text-red-600">Delete Account Permanently</DialogTitle>
                                            <DialogDescription className="text-slate-500 font-medium pt-2">
                                                This action is <strong>irreversible</strong>. All your data, including profile settings and preferences, will be erased.
                                                <br /><br />
                                                Active orders will prevent deletion.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="p-8 pt-0 space-y-4">
                                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type "DELETE" to confirm</Label>
                                            <Input
                                                value={deleteConfirmation}
                                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                className="h-12 rounded-xl border-slate-200 font-bold text-slate-900"
                                                placeholder="DELETE"
                                            />
                                        </div>
                                        <DialogFooter className="p-6 bg-slate-50/50 gap-2 sm:gap-0">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsDeleteModalOpen(false)}
                                                className="rounded-xl font-bold text-slate-500 hover:bg-slate-100 h-12"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                                                onClick={async () => {
                                                    setIsDeleting(true)
                                                    try {
                                                        const { deleteMyAccount } = await import('@/app/actions/profile-actions')
                                                        const res = await deleteMyAccount()

                                                        if (res.success) {
                                                            toast.success("Account deleted. Goodbye!")
                                                            window.location.href = '/'
                                                        } else {
                                                            throw new Error(res.error)
                                                        }
                                                    } catch (error: any) {
                                                        toast.error("Deletion Failed", { description: error.message })
                                                        setIsDeleting(false)
                                                    }
                                                }}
                                                className="rounded-xl font-bold bg-red-600 hover:bg-red-700 h-12 px-6"
                                            >
                                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Deletion"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hub">
                    <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl min-h-[400px] flex items-center justify-center">
                        <CardContent className="p-10 text-center space-y-6">
                            <div className="h-24 w-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto shadow-inner border border-indigo-100">
                                <Globe className="h-10 w-10 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold text-slate-900 uppercase tracking-tighter italic">Sovereign Innovation</h3>
                                <p className="text-slate-500 font-semibold text-sm tracking-widest uppercase opacity-60">Portal Hub Overhaul: Coming Soon</p>
                            </div>
                            <div className="pt-4">
                                <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-6 py-2">Version 3.0 Pipeline</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system">
                    <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-[#0c1425] text-white min-h-[400px] flex items-center justify-center">
                        <CardContent className="p-10 text-center space-y-6">
                            <div className="h-24 w-24 rounded-[2rem] bg-orange-600/10 flex items-center justify-center text-orange-500 mx-auto border border-orange-500/20 shadow-2xl shadow-orange-500/10">
                                <Server className="h-10 w-10 animate-bounce" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold text-white uppercase tracking-tighter italic">Edge Intelligence</h3>
                                <p className="text-slate-400 font-semibold text-sm tracking-widest uppercase opacity-60">System Console: Coming Soon</p>
                            </div>
                            <div className="pt-4">
                                <Badge className="bg-orange-600/20 text-orange-500 border border-orange-500/20 px-6 py-2">Deployment Cycle Locked</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={cn("px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest", className)}>
            {children}
        </span>
    )
}
