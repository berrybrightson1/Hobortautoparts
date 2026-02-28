'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import { InteractiveNotification } from '@/components/portal/interactive-notification';
import { toast } from 'sonner';

interface NotificationRow {
    id: string;
    title: string;
    message: string;
    type: 'order' | 'promo' | 'system' | 'request';
    link?: string | null;
}

export function BillingNotificationProvider() {
    const { user } = useAuth();
    const [activeNotification, setActiveNotification] = useState<NotificationRow | null>(null);
    const [queue, setQueue] = useState<NotificationRow[]>([]);

    const dismiss = useCallback(() => {
        setActiveNotification(null);
        setQueue(prev => {
            if (prev.length > 0) {
                const [next, ...rest] = prev;
                setTimeout(() => setActiveNotification(next), 300);
                return rest;
            }
            return prev;
        });
    }, []);

    const showNotification = useCallback((notification: NotificationRow) => {
        // Also fire a sonner toast for less obtrusive feedback
        toast.info(notification.title, { description: notification.message });

        setActiveNotification(prev => {
            if (prev) {
                // Queue it instead of replacing
                setQueue(q => [...q, notification]);
                return prev;
            }
            return notification;
        });
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`billing-notifications-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    showNotification(payload.new as NotificationRow);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, showNotification]);

    return (
        <InteractiveNotification
            notification={activeNotification}
            onClose={dismiss}
        />
    );
}
