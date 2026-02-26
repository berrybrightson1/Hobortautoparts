'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from "next/navigation"
import { supabase } from '@/lib/supabase'

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
                    setUser(session.user)
                    await fetchProfile(session.user)
                }
            } catch (err) {
                console.error("AuthProvider: Init error:", err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        if (initialSession?.user) {
            fetchProfile(initialSession.user)
        }

        initSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return

                // Handle token refresh errors that might come through events
                if (event === 'SIGNED_OUT') {
                    setUser(null)
                    setProfile(null)
                    setLoading(false)
                    return
                }

                if (session?.user) {
                    // Only update if different user or profile missing
                    if (session.user.id !== user?.id) {
                        setUser(session.user)
                        await fetchProfile(session.user)
                    }
                } else {
                    setUser(null)
                    setProfile(null)
                }
                setLoading(false)
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const fetchProfile = async (currentUser: User) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single()

            if (!error && data) {
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

            console.warn("AuthProvider: Profile row missing, creating from metadata...")

            const { data: newProfile, error: syncError } = await supabase
                .from('profiles')
                .upsert({
                    id: currentUser.id,
                    full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
                    role: currentUser.user_metadata?.role || 'customer',
                    phone_number: currentUser.user_metadata?.phone,
                }, { onConflict: 'id' })
                .select()
                .single()

            if (!syncError) {
                setProfile(newProfile)
            } else {
                // If upsert also fails with empty error or FK violation, it's a ghost session
                const isFKViolation = syncError?.code === '23503'
                const isSyncGhost = !syncError?.code || Object.keys(syncError).length === 0
                if (isFKViolation || isSyncGhost) {
                    console.warn("AuthProvider: Cannot sync deleted user, signing out.")
                    await signOut()
                } else {
                    console.error("AuthProvider: Sync error:", syncError)
                    setProfile({ role: currentUser.user_metadata?.role || 'customer' })
                }
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
        // Immediately clear client state so the UI responds before the network call finishes
        setUser(null)
        setProfile(null)
        localStorage.clear()

        // Fire Supabase sign-out in the background (don't await — we already cleared state)
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
