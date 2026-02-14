"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { User, Shield, Key, Loader2, Save, Unlock, Moon, Minimize2, Bell, Mail, Settings2, Globe, Server } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function UnifiedSettingsPage() {
    const { user, profile } = useAuth()
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
    const [isLoadingPrefs, setIsLoadingPrefs] = useState(true)

    // Profile State
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")

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
            if (data) setPrefs(data)
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoadingPrefs(false)
        }
    }

    const handleUpdateProfile = async () => {
        if (!user) return
        setIsSavingProfile(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName, phone_number: phoneNumber })
                .eq('id', user.id)
            if (error) throw error
            toast.success("Profile details updated")
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
        try {
            await supabase.from('user_preferences').upsert({
                user_id: user.id,
                [key]: val,
                updated_at: new Date().toISOString()
            })
            toast.success("Preference synchronized")
        } catch (e) {
            toast.error("Sync failed")
        }
    }

    if (isLoadingPrefs) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
                    {profile?.role === 'admin' ? 'Console & Profile' : 'Account & Settings'}
                </h2>
                <p className="text-slate-500 font-medium text-lg">Manage your global identity, portal behavior, and security protocols.</p>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="flex w-fit mb-8 h-14 bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
                    <TabsTrigger value="account" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary-blue font-bold transition-all">Account</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary-blue font-bold transition-all">Security</TabsTrigger>
                    <TabsTrigger value="hub" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary-blue font-bold transition-all">Portal Hub</TabsTrigger>
                    {profile?.role === 'admin' && (
                        <TabsTrigger value="system" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-orange-600 font-bold transition-all gap-2">
                            <Server className="h-4 w-4" /> System
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="account">
                    <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                        <CardHeader className="p-10 pb-6 border-b border-slate-50">
                            <CardTitle className="text-2xl font-bold text-slate-900">Identity Details</CardTitle>
                            <CardDescription className="text-slate-500 text-base">Your official platform representation and core contact data.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            <div className="flex items-center gap-8 bg-gradient-to-br from-slate-50 to-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-primary-blue to-blue-600 flex items-center justify-center text-white border-4 border-white shadow-2xl transition-transform group-hover:scale-105 duration-500">
                                    <User className="h-12 w-12" />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <h4 className="font-black text-xl text-slate-900">Portal Identity</h4>
                                    <p className="text-sm text-slate-500 font-bold max-w-sm leading-relaxed">Identity is tied to encrypted email metadata. Avatars are synchronized via global protocols for: <span className="text-primary-blue">{user?.email}</span></p>
                                </div>
                                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Legal Name</Label>
                                    <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Verified Mobile</Label>
                                    <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/80 p-10 flex justify-end">
                            <Button onClick={handleUpdateProfile} disabled={isSavingProfile} className="h-14 px-10 rounded-2xl bg-primary-blue hover:bg-blue-700 shadow-xl shadow-blue-500/20 font-black gap-3 transition-all active:scale-95">
                                {isSavingProfile ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                                Synchronize Identity
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                        <CardHeader className="p-10 pb-6 border-b border-slate-50">
                            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <Shield className="h-6 w-6 text-emerald-500" /> Security Protocol
                            </CardTitle>
                            <CardDescription className="text-slate-500 text-base">Old password verification required for all credential shifts.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Verified Current Password</Label>
                                <Input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white font-bold" placeholder="Required to authorize changes" />
                            </div>
                            <div className="grid grid-cols-2 gap-8 pt-4">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">New Secure Cipher</Label>
                                    <Input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm Cipher</Label>
                                    <Input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white font-bold" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/80 p-10 flex justify-end">
                            <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-black shadow-xl shadow-black/20 font-black gap-3 transition-all active:scale-95">
                                {isUpdatingPassword ? <Loader2 className="animate-spin h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                                Authorize & Update
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="hub">
                    <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                        <CardHeader className="p-10 pb-6 border-b border-slate-50">
                            <CardTitle className="text-2xl font-bold text-slate-900">Portal Preferences</CardTitle>
                            <CardDescription className="text-slate-500 text-base">Configure your interaction experience and visual language.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-6">
                            <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50 hover:bg-white transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                                        <Moon className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-slate-900">Visual Midnight Mode</h4>
                                        <p className="text-xs text-slate-500 font-medium italic">Apply deep-space theme to the entire portal dashboard.</p>
                                    </div>
                                </div>
                                <Switch checked={prefs.dark_mode} onCheckedChange={v => togglePref('dark_mode', v)} />
                            </div>
                            <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50 hover:bg-white transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 transition-transform group-hover:scale-110">
                                        <Minimize2 className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-slate-900">Condensed Architecture</h4>
                                        <p className="text-xs text-slate-500 font-medium italic">High-density layout optimization for sourcing experts.</p>
                                    </div>
                                </div>
                                <Switch checked={prefs.compact_mode} onCheckedChange={v => togglePref('compact_mode', v)} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system">
                    <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-[#0c1425] text-white">
                        <CardHeader className="p-10 pb-6 border-b border-white/5">
                            <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                                <Settings2 className="h-6 w-6 text-orange-500" /> Platform Console
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-base">Global administrative configurations and system health status.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Globe className="h-8 w-8 text-blue-400" />
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-0 font-black">ACTIVE</Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="font-bold">Edge Protocol</h5>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">Automated Traffic Routing & CDN Status Verified.</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Shield className="h-8 w-8 text-orange-400" />
                                        <Badge className="bg-orange-500/20 text-orange-400 border-0 font-black">SECURE</Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="font-bold">Database Fortress</h5>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">Supabase RLS & Encrypted Sync Active.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-[2rem] bg-orange-600/10 border border-orange-600/20 text-orange-200 flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20 shrink-0">
                                    <Server className="h-7 w-7" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-[0.1em]">Engine Update v2.1.0 Ready</p>
                                    <p className="text-sm font-medium opacity-80">Platform settings are currently locked to Global Defaults. Advanced overrides coming in next deployment.</p>
                                </div>
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
        <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold tracking-widest", className)}>
            {children}
        </span>
    )
}
