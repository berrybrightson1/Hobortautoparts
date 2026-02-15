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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    const router = useRouter()

    useEffect(() => {
        // Get initial session
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error("AuthProvider: Initial session error:", error)
                    // If refresh token is explicitly invalid/missing, clear everything
                    if (error.message?.includes("refresh_token_not_found") || error.message?.includes("Refresh Token Not Found")) {
                        await signOut()
                        return
                    }
                }

                if (session?.user) {
                    setUser(session.user)
                    await fetchProfile(session.user)
                }
            } catch (err) {
                console.error("AuthProvider: initAuth unexpected error:", err)
            } finally {
                setLoading(false)
            }
        }

        initAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    setUser(null)
                    setProfile(null)
                    setLoading(false)
                    return
                }

                if (session?.user) {
                    setUser(session.user)
                    await fetchProfile(session.user)
                } else {
                    setUser(null)
                    setProfile(null)
                }
                setLoading(false)
            }
        )

        return () => {
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

            console.warn("AuthProvider: Profile not found, attempting sync...", error)

            // Fallback: Use the currentUser object directly instead of fetching again
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
                console.error("AuthProvider: Sync error:", syncError)
                // If everything fails, at least set a minimal profile to avoid hanging login
                setProfile({ role: currentUser.user_metadata?.role || 'customer' })
            }
        } catch (err) {
            console.error("AuthProvider: Unexpected sync error:", err)
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
        await supabase.auth.signOut()
        // Clear legacy state and local storage to prevent ghost "Dashboard" links
        localStorage.clear()

        // Use router for smoother transition instead of hard reload
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
