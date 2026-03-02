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
        const userAgent = headerList.get('user-agent') || 'Unknown Device';

        // Check for new device before inserting the new audit log
        if (action === 'login' && user) {
            const { data: previousLogins } = await supabase
                .from('audit_logs')
                .select('ip_address, details')
                .eq('user_id', user.id)
                .eq('action', 'login')
                .order('created_at', { ascending: false })
                .limit(5);

            const isNewDevice = previousLogins && previousLogins.length > 0 && !previousLogins.some(log =>
                log.ip_address === ip || log.details?.userAgent === userAgent
            );

            details.userAgent = userAgent;

            if (isNewDevice) {
                const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', user.id).single();
                if (profile?.email) {
                    const { sendNewDeviceEmailAction } = await import('@/app/actions/email-actions');
                    const location = ip !== 'unknown' && ip !== '::1' && ip !== '127.0.0.1' ? `IP Address: ${ip}` : 'Unknown Location';
                    await sendNewDeviceEmailAction(
                        profile.email,
                        profile.full_name?.split(' ')[0] || 'Customer',
                        userAgent,
                        location,
                        new Date().toLocaleString()
                    );
                }
            }
        }

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
