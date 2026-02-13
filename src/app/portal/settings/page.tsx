"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2, Moon, Minimize2, Bell, Mail } from "lucide-react"

interface UserPreferences {
    dark_mode: boolean
    compact_mode: boolean
    email_notifications: boolean
    order_notifications: boolean
    email_summaries: boolean
}

export default function SettingsPage() {
    const { profile, user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingPrefs, setIsLoadingPrefs] = useState(true)
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [preferences, setPreferences] = useState<UserPreferences>({
        dark_mode: false,
        compact_mode: false,
        email_notifications: true,
        order_notifications: true,
        email_summaries: false
    })

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "")
            setPhoneNumber(profile.phone_number || "")
        }
    }, [profile])

    useEffect(() => {
        if (user) {
            fetchPreferences()
        }
    }, [user])

    const fetchPreferences = async () => {
        if (!user) return
        setIsLoadingPrefs(true)

        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error
            }

            if (data) {
                setPreferences({
                    dark_mode: data.dark_mode,
                    compact_mode: data.compact_mode,
                    email_notifications: data.email_notifications,
                    order_notifications: data.order_notifications,
                    email_summaries: data.email_summaries
                })
            } else {
                // Create default preferences
                await createDefaultPreferences()
            }
        } catch (error: any) {
            console.error("Error fetching preferences:", error)
        } finally {
            setIsLoadingPrefs(false)
        }
    }

    const createDefaultPreferences = async () => {
        if (!user) return

        try {
            const { error } = await supabase
                .from('user_preferences')
                .insert({
                    user_id: user.id,
                    dark_mode: false,
                    compact_mode: false,
                    email_notifications: true,
                    order_notifications: true,
                    email_summaries: false
                })

            if (error) throw error
        } catch (error: any) {
            console.error("Error creating default preferences:", error)
        }
    }

    const updatePreference = async (key: keyof UserPreferences, value: boolean) => {
        if (!user) return

        const newPreferences = { ...preferences, [key]: value }
        setPreferences(newPreferences)

        try {
            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user.id,
                    ...newPreferences,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error

            toast.success("Preference updated", {
                description: `${key.replace('_', ' ')} has been ${value ? 'enabled' : 'disabled'}.`
            })

            // Apply compact mode immediately
            if (key === 'compact_mode') {
                if (value) {
                    document.documentElement.classList.add('compact-mode')
                } else {
                    document.documentElement.classList.remove('compact-mode')
                }
            }

            // Apply dark mode immediately
            if (key === 'dark_mode') {
                if (value) {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }
            }
        } catch (error: any) {
            console.error("Error updating preference:", error)
            // Revert on error
            setPreferences(preferences)
            toast.error("Failed to update preference", {
                description: error.message
            })
        }
    }

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

    if (isLoadingPrefs) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-primary-blue animate-spin" />
                    <p className="text-sm font-semibold text-slate-500">Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
            <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h2>
                <p className="text-slate-500 font-medium">Manage your portal preferences and notification settings.</p>
            </div>

            {/* General Preferences */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">General Preferences</CardTitle>
                    <CardDescription>Configure general portal behavior and appearance.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <Moon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="font-semibold text-slate-900">Dark Mode</h4>
                                <p className="text-sm text-slate-500 font-medium">Enable dark theme for the portal.</p>
                            </div>
                        </div>
                        <Switch
                            checked={preferences.dark_mode}
                            onCheckedChange={(checked) => updatePreference('dark_mode', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                                <Minimize2 className="h-5 w-5 text-cyan-600" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="font-semibold text-slate-900">Compact Mode</h4>
                                <p className="text-sm text-slate-500 font-medium">Reduce spacing for higher information density.</p>
                            </div>
                        </div>
                        <Switch
                            checked={preferences.compact_mode}
                            onCheckedChange={(checked) => updatePreference('compact_mode', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">Notification Settings</CardTitle>
                    <CardDescription>Control how and when you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="font-semibold text-slate-900">Email Notifications</h4>
                                <p className="text-sm text-slate-500 font-medium">Receive email notifications for important updates.</p>
                            </div>
                        </div>
                        <Switch
                            checked={preferences.email_notifications}
                            onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="font-semibold text-slate-900">Order Notifications</h4>
                                <p className="text-sm text-slate-500 font-medium">Get notified about order status changes.</p>
                            </div>
                        </div>
                        <Switch
                            checked={preferences.order_notifications}
                            onCheckedChange={(checked) => updatePreference('order_notifications', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Mail className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="font-semibold text-slate-900">Weekly Summaries</h4>
                                <p className="text-sm text-slate-500 font-medium">Receive weekly email summaries of your activity.</p>
                            </div>
                        </div>
                        <Switch
                            checked={preferences.email_summaries}
                            onCheckedChange={(checked) => updatePreference('email_summaries', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Profile Information */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">Profile Information</CardTitle>
                    <CardDescription>Update your personal details and contact information.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">Full Name</label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-700">Phone Number</label>
                        <Input
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                        <Input
                            id="email"
                            value={user?.email || ""}
                            disabled
                            className="h-12 rounded-2xl border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 font-medium">Email cannot be changed from this page.</p>
                    </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full h-12 rounded-2xl bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 font-semibold transition-all hover:shadow-xl"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
