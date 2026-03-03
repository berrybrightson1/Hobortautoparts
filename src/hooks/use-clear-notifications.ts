import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';

/**
 * Automatically marks all notifications of a specific type as read
 * when the user visits the associated page.
 */
export function useClearNotifications(type: 'request' | 'order' | 'system' | 'promo') {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const clearNotifications = async () => {
            try {
                const { error } = await supabase
                    .from('notifications')
                    .update({ read: true })
                    .eq('user_id', user.id)
                    .eq('type', type)
                    .eq('read', false);

                if (error) {
                    console.error(`Failed to clear ${type} notifications:`, error);
                }
            } catch (err) {
                console.error('Error clearing notifications:', err);
            }
        };

        clearNotifications();
    }, [user, type]);
}
