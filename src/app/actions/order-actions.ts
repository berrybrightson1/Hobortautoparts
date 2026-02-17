'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-checks'
import { sendNotification } from '@/lib/notifications'
import { logAction } from '@/lib/audit'


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
    try {
        await requireAdmin()
        const supabase = getAdminClient()
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
    try {
        await requireAdmin()
        const supabase = getAdminClient()
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        if (error) throw error

        // Notify Customer of Status Update
        try {
            const { data: order } = await supabase
                .from('orders')
                .select('user_id, status')
                .eq('id', orderId)
                .single()

            if (order) {
                await sendNotification({
                    userId: order.user_id,
                    title: 'Order Status Updated',
                    message: `Your order status has been updated to ${newStatus.toUpperCase()}.`,
                    type: 'order'
                })
            }
        } catch (notifyErr) {
            console.warn('Non-blocking notification failure:', notifyErr)
        }

        revalidatePath('/portal/admin/orders')

        await logAction('update_order_status', {
            orderId,
            newStatus,
            adminId: (await getAdminClient().auth.getUser()).data.user?.id
        })

        return { success: true }
    } catch (error: any) {
        console.error("Update Order Status Error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateServiceFee(quoteId: string, serviceFee: number) {
    try {
        await requireAdmin()
        const supabase = getAdminClient()

        // 1. Get current quote details to recalculate total
        const { data: quote, error: fetchError } = await supabase
            .from('quotes')
            .select('item_price, shipping_cost')
            .eq('id', quoteId)
            .single()

        if (fetchError) throw fetchError

        // Ensure values are numbers (stripping currency symbols if needed, though they should be numeric in DB)
        // Postgres MONEY type returns as string like "$10.00". Need to parse.
        // Actually, supabase-js might return them as strings.
        const parseMoney = (val: any) => {
            if (typeof val === 'number') return val
            return parseFloat(String(val).replace(/[^0-9.-]+/g, ''))
        }

        const itemPrice = parseMoney(quote.item_price)
        const shippingCost = parseMoney(quote.shipping_cost)
        const newTotal = itemPrice + shippingCost + serviceFee

        // 2. Update quote
        const { error: updateError } = await supabase
            .from('quotes')
            .update({
                service_fee: serviceFee,
                total_amount: newTotal
            })
            .eq('id', quoteId)

        if (updateError) throw updateError

        // Notify Customer of Fee Adjustment (Optional, but good for transparency)
        try {
            const { data: order } = await supabase
                .from('orders')
                .select('user_id')
                .eq('quote_id', quoteId)
                .single()

            if (order) {
                await sendNotification({
                    userId: order.user_id,
                    title: 'Service Fee Updated',
                    message: `A service fee of $${serviceFee} has been applied to your quote.`,
                    type: 'system'
                })
            }
        } catch (notifyErr) {
            console.warn('Non-blocking notification failure:', notifyErr)
        }

        revalidatePath('/portal/admin/orders')

        await logAction('update_service_fee', {
            quoteId,
            serviceFee,
            newTotal
        })

        return { success: true }
    } catch (error: any) {
        console.error("Update Service Fee Error:", error)
        return { success: false, error: error.message }
    }
}
