'use server'

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function logAction(action: string, details: Record<string, any> = {}) {
    try {
        const supabase = await createClient();

        // Get current user (if any)
        const { data: { user } } = await supabase.auth.getUser();

        // Get IP address if possible (from headers)
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';

        const { error } = await supabase.from('audit_logs').insert({
            user_id: user?.id || null, // Allow null for system actions or errors before login
            action,
            details,
            ip_address: ip,
        });

        if (error) {
            console.error('Error logging action:', error);
        }
    } catch (err) {
        console.error('Failed to log action:', err);
    }
}
