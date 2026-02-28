"use server";

import { resend } from '@/lib/email';
import CustomerWelcome from '@/emails/CustomerWelcome';
import AgentWelcome from '@/emails/AgentWelcome';
import RequestUpdateEmail from '@/emails/RequestUpdateEmail';
import VerificationCodeEmail from '@/emails/VerificationCode';
import { supabase } from '@/lib/supabase';

export async function sendWelcomeEmailAction(email: string, firstName: string, role: string = 'customer') {
    try {
        const EmailTemplate = role === 'agent' ? AgentWelcome : CustomerWelcome;

        const { data, error } = await resend.emails.send({
            from: 'Hobort Auto Express <notifications@hobortautopartsexpress.com>',
            to: email,
            subject: role === 'agent' ? 'Hobort B2B Agent Network - Welcome' : 'Welcome to Hobort Auto Parts Express',
            react: EmailTemplate({ firstName }),
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
            from: 'Hobort Auto Express <notifications@hobortautopartsexpress.com>',
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
