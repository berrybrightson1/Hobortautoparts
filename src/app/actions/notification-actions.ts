'use server'

import { sendNotification as sendNotificationLogic, notifyAdmins as notifyAdminsLogic } from "@/lib/notifications"

// Re-export the type if needed, or define compatible interface
interface NotificationPayload {
    userId: string
    title: string
    message: string
    type?: 'system' | 'order' | 'quote' | 'sourcing' | 'shipment' | 'request' | 'promo'
}

const mapTypeToDb = (type: NotificationPayload['type']): 'system' | 'order' | 'promo' | 'request' => {
    switch (type) {
        case 'quote':
        case 'shipment':
            return 'order'
        case 'sourcing':
            return 'request'
        case 'promo':
            return 'promo'
        case 'request':
            return 'request'
        case 'order':
            return 'order'
        default:
            return 'system'
    }
}

export async function sendNotificationAction(payload: NotificationPayload) {
    const dbType = mapTypeToDb(payload.type)
    return await sendNotificationLogic({
        ...payload,
        type: dbType
    })
}

export async function notifyAdminsAction(payload: Omit<NotificationPayload, 'userId'>) {
    const dbType = mapTypeToDb(payload.type)
    return await notifyAdminsLogic({
        ...payload,
        type: dbType
    })
}
