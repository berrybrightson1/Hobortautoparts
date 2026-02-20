'use server';

import { resend } from '@/lib/email';
import WelcomeEmail from '@/emails/WelcomeEmail';
import RequestUpdateEmail from '@/emails/RequestUpdateEmail';
import { supabase } from '@/lib/supabase';

export async function sendWelcomeEmailAction(email: string, firstName: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Hobort Auto Express <notifications@hobortautoparts.com>',
            to: email,
            subject: 'Welcome to Hobort Auto Parts Express',
            react: WelcomeEmail({ firstName }),
        });

        if (error) {
            console.error('Failed to send welcome email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email action error:', error);
        return { success: false, error };
    }
}

export async function sendRequestUpdateEmailAction(requestId: string) {
    try {
        // Fetch request and user details
        const { data: request, error: fetchError } = await supabase
            .from('sourcing_requests')
            .select(`
                *,
                profiles (
                    full_name,
                    email,
                    id
                )
            `)
            .eq('id', requestId)
            .single();

        if (fetchError || !request || !request.profiles?.email) {
            console.error('Failed to fetch request or email for notification:', fetchError);
            return { success: false, error: fetchError || 'Email not found' };
        }

        const { data, error } = await resend.emails.send({
            from: 'Hobort Auto Express <notifications@hobortautoparts.com>',
            to: request.profiles.email,
            subject: `Update on your request: ${request.part_name}`,
            react: RequestUpdateEmail({
                firstName: request.profiles.full_name.split(' ')[0],
                partName: request.part_name,
                status: request.status,
                requestId: request.id,
            }),
        });

        if (error) {
            console.error('Failed to send update email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email action error:', error);
        return { success: false, error };
    }
}
