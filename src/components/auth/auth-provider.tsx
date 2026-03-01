'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from "next/navigation"
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { createOrUpdateProfile } from '@/app/actions/admin-actions'

type AuthContextType = {
    user: User | null
    profile: any | null
    loading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
})

export const AuthProvider = ({
    children,
    initialSession
}: {
    children: React.ReactNode,
    initialSession?: any
}) => {
    const [user, setUser] = useState<User | null>(initialSession?.user || null)
    const [profile, setProfile] = useState<any | null>(null)
    const [loading, setLoading] = useState(!initialSession)

    const router = useRouter()

    useEffect(() => {
        let mounted = true

        // Check for session immediately
        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (!mounted) return

                if (error) {
                    // Suppress "Refresh Token Not Found" noise, just sign out
                    if (error.message?.includes("Refresh Token Not Found") || error.message?.includes("refresh_token_not_found")) {
                        console.warn("AuthProvider: Stale session detected, clearing...")
                        await signOut()
                        return
                    }
                    console.error("AuthProvider: Session check error:", error)
                }

                if (session?.user) {
                    if (session.user.email_confirmed_at) {
                        setUser(session.user)
                        await fetchProfile(session.user)
                    } else {
                        console.warn("AuthProvider: Ignoring unconfirmed email session.")
                    }
                }
            } catch (err) {
                console.error("AuthProvider: Init error:", err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        if (initialSession?.user && initialSession.user.email_confirmed_at) {
            fetchProfile(initialSession.user)
        }

        initSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return

                if (event === 'SIGNED_OUT') {
                    setUser(null)
                    setProfile(null)
                    setLoading(false)
                    return
                }

                if (session?.user) {
                    if (session.user.email_confirmed_at) {
                        setUser(session.user)
                        // Always re-fetch profile on any sign-in event so the context is up to date
                        await fetchProfile(session.user)
                    } else {
                        console.warn("AuthProvider: Session change ignored for unconfirmed email.")
                        setUser(null)
                        setProfile(null)
                    }
                } else {
                    setUser(null)
                    setProfile(null)
                }
                setLoading(false)
            }
        )

        // ── Real-time profile watcher ─────────────────────────────────────
        // When an admin approves/declines a pending agent, the `profiles` row
        // is updated server-side. This subscription detects that change and
        // immediately re-fetches the profile so the UI (e.g. pending modal)
        // updates without requiring a page refresh.
        let profileChannel: ReturnType<typeof supabase.channel> | null = null

        const setupProfileChannel = (userId: string) => {
            profileChannel = supabase
                .channel(`profile_role_watch:${userId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${userId}`,
                    },
                    async (payload) => {
                        if (!mounted) return
                        // Re-fetch the full profile so all fields (role, etc.) are fresh
                        const { data } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', userId)
                            .single()
                        if (data && mounted) setProfile(data)
                    }
                )
                .subscribe()
        }

        // Set up the channel once we have a user
        if (initialSession?.user?.id) {
            setupProfileChannel(initialSession.user.id)
        }

        return () => {
            mounted = false
            subscription.unsubscribe()
            if (profileChannel) supabase.removeChannel(profileChannel)
        }
    }, [])

    const fetchProfile = async (currentUser: User) => {
        try {
            // Small delay to allow Postgres trigger to safely commit before querying from replica
            await new Promise(resolve => setTimeout(resolve, 500))

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single()

            if (!error && data) {
                // Ensure Phone Number is synchronized from Auth to Profile
                const authPhone = currentUser.phone || currentUser.user_metadata?.phone_number || currentUser.user_metadata?.phone;
                if (authPhone && !data.phone_number) {
                    supabase.from('profiles').update({ phone_number: authPhone }).eq('id', currentUser.id).then()
                    data.phone_number = authPhone
                }
                setProfile(data)
                return
            }

            // PGRST116 = row not found (profile missing — try to auto-create it)
            // Empty error object {} = FK violation (auth user deleted from Supabase dashboard
            // but browser still holds a valid JWT session token)
            const isNotFound = error?.code === 'PGRST116'
            const isEmptyOrGhostError = !error?.code || Object.keys(error).length === 0

            if (isEmptyOrGhostError && !isNotFound) {
                // Ghost session — user deleted from Supabase, clear and redirect
                console.warn("AuthProvider: Ghost session detected — user no longer exists, signing out.")
                await signOut()
                return
            }

            console.warn("AuthProvider: Profile row missing, creating via Server Action...")

            const syncRes = await createOrUpdateProfile(currentUser.id, {
                full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
                role: currentUser.user_metadata?.role || 'customer',
                phone: currentUser.phone || currentUser.user_metadata?.phone_number || currentUser.user_metadata?.phone,
            })

            if (syncRes.success && syncRes.profile) {
                setProfile(syncRes.profile)
            } else {
                // If it fails, fallback to local state mimicking
                console.error("AuthProvider: Secure sync error:", syncRes.error)
                setProfile({ role: currentUser.user_metadata?.role || 'customer' })
            }
        } catch (err) {
            console.error("AuthProvider: Unexpected error in fetchProfile:", err)
        } finally {
            setLoading(false)
        }
    }

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user)
        }
    }

    const signOut = async () => {
        // Log out action before state is cleared
        if (user?.email) {
            logAction('logout', { email: user.email }).catch(console.warn)
        }

        // Immediately clear client state so the UI responds before the network call finishes
        setUser(null)
        setProfile(null)
        localStorage.clear()

        // Fire Supabase sign-out in the background
        supabase.auth.signOut().catch(console.warn)

        router.push('/')
        router.refresh()
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
