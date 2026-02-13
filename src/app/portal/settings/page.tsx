"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
    const { profile, user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "")
            setPhoneNumber(profile.phone_number || "")
        }
    }, [profile])

    const handleSave = async () => {
        if (!user) return
        setIsLoading(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone_number: phoneNumber,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)

            if (error) throw error

            toast.success("Settings updated", {
                description: "Your profile information has been saved successfully."
            })
        } catch (error: any) {
            console.error("Error updating settings:", error)
            toast.error("Failed to update settings", {
                description: error.message || "An unexpected error occurred."
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
            <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h2>
                <p className="text-slate-500 font-medium">Manage your portal preferences and notification settings.</p>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">General Preferences</CardTitle>
                    <CardDescription>Configure general portal behavior and appearance.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="space-y-0.5">
                            <h4 className="font-semibold text-slate-900">Dark Mode</h4>
                            <p className="text-sm text-slate-500 font-medium">Enable dark theme for the portal (Coming Soon).</p>
                        </div>
                        <Switch disabled />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="space-y-0.5">
                            <h4 className="font-semibold text-slate-900">Compact Mode</h4>
                            <p className="text-sm text-slate-500 font-medium">Reduce spacing for higher information density.</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">Notifications</CardTitle>
                    <CardDescription>Choose what you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="space-y-0.5">
                            <h4 className="font-semibold text-slate-900">New Order Alerts</h4>
                            <p className="text-sm text-slate-500 font-medium">Receive notifications when a new order is assigned.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="space-y-0.5">
                            <h4 className="font-semibold text-slate-900">Email Summaries</h4>
                            <p className="text-sm text-slate-500 font-medium">Receive a daily digest of activity.</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">Profile Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your full name"
                            className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
                        <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+233..."
                            className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                        <Input value={user?.email || ""} disabled className="h-11 rounded-xl border-slate-200 bg-slate-100 text-slate-500" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-slate-50 bg-slate-50/30 p-8">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="rounded-xl bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 px-6 h-11 font-semibold transition-all active:scale-95"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
