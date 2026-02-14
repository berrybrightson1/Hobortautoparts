"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { User, Bell, Shield, Key, Loader2, Save, Unlock } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function ProfilePage() {
    const { user, profile } = useAuth()
    const [isSaving, setIsSaving] = useState(false)
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

    // Profile State
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")

    // Password State
    const [passwords, setPasswords] = useState({
        new: "",
        confirm: ""
    })

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "")
            setPhoneNumber(profile.phone_number || "")
        }
    }, [profile])

    const handleUpdateProfile = async () => {
        if (!user) return
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone_number: phoneNumber
                })
                .eq('id', user.id)

            if (error) throw error
            toast.success("Profile updated successfully")
        } catch (error: any) {
            toast.error("Update failed", { description: error.message })
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error("Passwords do not match")
            return
        }
        if (passwords.new.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setIsUpdatingPassword(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            })

            if (error) throw error
            toast.success("Password updated successfully")
            setPasswords({ new: "", confirm: "" })
        } catch (error: any) {
            toast.error("Update failed", { description: error.message })
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h2>
                <p className="text-slate-500 font-medium">Manage your personal information and security credentials.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                    <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary-blue transition-all font-semibold">
                        General Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary-blue transition-all font-semibold">
                        Security & Privacy
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-bold text-slate-900">Personal Details</CardTitle>
                            <CardDescription className="text-slate-500">Update your public profile and contact information.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary-blue/10 to-blue-600/10 flex items-center justify-center text-primary-blue border-2 border-white shadow-lg">
                                    <User className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-slate-900">Profile Avatar</h4>
                                    <p className="text-xs text-slate-500 font-medium max-w-[200px]">Avatar updates are managed via your gravatar email: {user?.email}</p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2.5">
                                    <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Account Email (Static)</Label>
                                <Input
                                    id="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="h-12 rounded-xl bg-slate-100 border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                                />
                                <p className="text-[10px] text-slate-400 italic ml-1">* Email changes require administrative validation.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 flex justify-end">
                            <Button
                                onClick={handleUpdateProfile}
                                disabled={isSaving}
                                className="font-bold rounded-xl px-8 h-12 bg-primary-blue hover:bg-blue-600 shadow-lg shadow-blue-500/20 gap-2 transition-all active:scale-95"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-bold text-slate-900">Security Credentials</CardTitle>
                            <CardDescription className="text-slate-500">Update your account password to maintain security.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="new" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">New Password</Label>
                                <Input
                                    id="new"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="confirm" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Confirm New Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    placeholder="Repeat new password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 items-start mt-4">
                                <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h5 className="text-sm font-bold text-amber-800">Security Tip</h5>
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Use a strong password with at least 8 characters, including numbers and special symbols for maximum protection.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 flex justify-end">
                            <Button
                                onClick={handleUpdatePassword}
                                disabled={isUpdatingPassword || !passwords.new}
                                className="font-bold rounded-xl px-8 h-12 bg-slate-900 hover:bg-black shadow-lg shadow-black/20 gap-2 transition-all active:scale-95"
                            >
                                {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                                Update Password
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

