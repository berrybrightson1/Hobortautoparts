import { supabase } from "./supabase" // Client for client-side/public inserts
import { Database } from "@/types/database.types"

type NotificationType = Database['public']['Tables']['notifications']['Row']['type']

interface NotificationPayload {
    userId: string
    title: string
    message: string
    type?: NotificationType
}

/**
 * Sends a real-time notification to a specific user by inserting a record into the notifications table.
 */
export async function sendNotification({
    userId,
    title,
    message,
    type = 'system'
}: NotificationPayload) {
    try {
        // 1. In-App Notification (Database)
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                read: false
            })

        if (error) {
            console.error('Error sending in-app notification:', error)
            return { success: false, error }
        }

        return { success: true }
    } catch (error) {
        console.error('Unexpected error sending notification:', error)
        return { success: false, error }
    }
}
/**
 * Sends a real-time notification to all users with the 'admin' role.
 */
export async function notifyAdmins({
    title,
    message,
    type = 'system'
}: Omit<NotificationPayload, 'userId'>) {
    try {
        // 1. Fetch all admin IDs
        const { data: admins, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')

        if (fetchError) throw fetchError
        if (!admins || admins.length === 0) return { success: true, message: 'No admins found' }

        // 2. Insert notifications for all admins
        const notifications = admins.map(admin => ({
            user_id: admin.id,
            title,
            message,
            type,
            read: false
        }))

        const { error: insertError } = await supabase
            .from('notifications')
            .insert(notifications)

        if (insertError) throw insertError

        return { success: true }
    } catch (error) {
        console.error('Error in notifyAdmins:', error)
        return { success: false, error }
    }
}
