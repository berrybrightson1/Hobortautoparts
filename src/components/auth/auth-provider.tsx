'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthContextType = {
    user: User | null
    profile: any | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                setUser(session.user)
                await fetchProfile(session.user.id)
            }

            setLoading(false)
        }

        initAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(session.user)
                    await fetchProfile(session.user.id)
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

    const fetchProfile = async (userId: string) => {
        console.log("AuthProvider: Fetching profile for", userId)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (!error && data) {
                console.log("AuthProvider: Existing profile found:", data.role)
                setProfile(data)
                return
            }

            console.log("AuthProvider: Profile not found or error:", error?.message)

            // Fallback: If profile doesn't exist, create it from user metadata
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                console.log("AuthProvider: Attempting to sync profile from auth metadata")
                const { data: newProfile, error: syncError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authUser.id,
                        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                        role: authUser.user_metadata?.role || 'customer',
                        phone_number: authUser.user_metadata?.phone,
                    })
                    .select()
                    .single()

                if (!syncError) {
                    console.log("AuthProvider: Profile synced successfully:", newProfile.role)
                    setProfile(newProfile)
                } else {
                    console.error("AuthProvider: Sync error:", syncError)
                }
            }
        } catch (err) {
            console.error("AuthProvider: Unexpected sync error:", err)
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        // Clear legacy state and local storage to prevent ghost "Dashboard" links
        localStorage.clear()
        // We can't directly call setRole here without importing the store, 
        // but clearing localStorage will reset it on next load if it's persisted.
        window.location.href = '/'
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
