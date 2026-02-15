import { createClient } from '@/lib/supabase/server'

export type AuthUser = {
    id: string
    email?: string
    role?: string
}

export async function requireUser(): Promise<AuthUser> {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error("Unauthorized: Login required")
    }

    // Fetch role from metadata or profiles
    // Metadata is faster as it's in the JWT usually, but let's be safe and check profile
    // Actually, user_metadata is good first check
    const role = user.user_metadata?.role || 'customer'

    return {
        id: user.id,
        email: user.email,
        role
    }
}

export async function requireAdmin(): Promise<AuthUser> {
    const user = await requireUser()

    // Double check against database for critical admin actions
    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role || user.role

    if (role !== 'admin') {
        throw new Error("Forbidden: Admin access only")
    }

    return { ...user, role: 'admin' }
}

export async function requireAgent(): Promise<AuthUser> {
    const user = await requireUser()
    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role || user.role

    if (role !== 'agent' && role !== 'admin') {
        throw new Error("Forbidden: Agent or Admin access only")
    }

    return { ...user, role: role as string }
}
