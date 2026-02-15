'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Initialize Admin Client
function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined")
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

export async function getAdminOrders() {
    const supabase = getAdminClient()

    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    phone_number
                ),
                quotes:quote_id (
                    request_id,
                    total_amount,
                    item_price,
                    shipping_cost,
                    service_fee,
                    currency
                ),
                shipments (
                    tracking_number,
                    status
                )
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return { success: true, data }
    } catch (error: any) {
        console.error("Fetch Admin Orders Error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const supabase = getAdminClient()

    try {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        if (error) throw error

        revalidatePath('/portal/admin/orders')
        return { success: true }
    } catch (error: any) {
        console.error("Update Order Status Error:", error)
        return { success: false, error: error.message }
    }
}
