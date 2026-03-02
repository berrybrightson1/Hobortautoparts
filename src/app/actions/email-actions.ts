"use server";

import { resend } from '@/lib/email';
import CustomerWelcome from '@/emails/CustomerWelcome';
import AgentWelcome from '@/emails/AgentWelcome';
import RequestUpdateEmail from '@/emails/RequestUpdateEmail';
import VerificationCodeEmail from '@/emails/VerificationCode';
import NewDeviceEmail from '@/emails/NewDeviceEmail';
import OrderConfirmationEmail from '@/emails/OrderConfirmationEmail';
import ShipmentUpdateEmail from '@/emails/ShipmentUpdateEmail';
import ProxyRequestEmail from '@/emails/ProxyRequestEmail';
import MessageNotificationEmail from '@/emails/MessageNotificationEmail';
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

export async function sendNewDeviceEmailAction(email: string, firstName: string, deviceName: string, location: string, time: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Hobort Auto Express <security@hobortautopartsexpress.com>',
            to: email,
            subject: 'Security Alert: New Sign-in Detected',
            react: NewDeviceEmail({ firstName, deviceName, location, time }),
        });
        if (error) {
            console.error('Failed to send new device email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Email action error:', error);
        return { success: false, error };
    }
}

export async function sendOrderConfirmationEmailAction(email: string, firstName: string, orderId: string, amount: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Hobort Auto Express <orders@hobortautopartsexpress.com>',
            to: email,
            subject: `Order Confirmation: ${orderId}`,
            react: OrderConfirmationEmail({ firstName, orderId, amount }),
        });
        if (error) {
            console.error('Failed to send order confirmation email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Email action error:', error);
        return { success: false, error };
    }
}

export async function sendShipmentUpdateEmailAction(email: string, firstName: string, trackingNumber: string, status: string, description: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Hobort Auto Express <tracking@hobortautopartsexpress.com>',
            to: email,
            subject: `Shipment Update: ${trackingNumber} is now ${status}`,
            react: ShipmentUpdateEmail({ firstName, trackingNumber, status, description }),
        });
        if (error) {
            console.error('Failed to send shipment update email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Email action error:', error);
        return { success: false, error };
    }
}

export async function sendProxyRequestEmailAction(email: string, firstName: string, agentName: string, actionType: 'sourcing_request' | 'order_payment', referenceId: string, details: string) {
    try {
        const actionLabel = actionType === 'sourcing_request' ? 'Sourcing Request Submitted' : 'Order Payment Processed';
        const { data, error } = await resend.emails.send({
            from: 'Hobort Auto Express <notifications@hobortautopartsexpress.com>',
            to: email,
            subject: `Action Required by Agent: ${actionLabel}`,
            react: ProxyRequestEmail({ firstName, agentName, actionType, referenceId, details }),
        });
        if (error) {
            console.error('Failed to send proxy request email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Email action error:', error);
        return { success: false, error };
    }
}

export async function sendMessageNotificationEmailAction(email: string, firstName: string, senderName: string, messagePreview: string, linkUrl: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Hobort Auto Express <support@hobortautopartsexpress.com>',
            to: email,
            subject: `New Message from ${senderName}`,
            react: MessageNotificationEmail({ firstName, senderName, messagePreview, linkUrl }),
        });
        if (error) {
            console.error('Failed to send message notification email:', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Email action error:', error);
        return { success: false, error };
    }
}
