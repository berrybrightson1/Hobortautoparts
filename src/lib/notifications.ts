import { supabase } from "./supabase"
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
            console.error('Error sending notification:', error)
            return { success: false, error }
        }

        return { success: true }
    } catch (error) {
        console.error('Unexpected error sending notification:', error)
        return { success: false, error }
    }
}
