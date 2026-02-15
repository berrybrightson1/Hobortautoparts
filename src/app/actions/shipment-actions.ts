'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { sendNotification } from '@/lib/notifications'

// Initialize Admin Client (Service Role)
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

export async function getShipments() {
    const supabase = getAdminClient()

    try {
        const { data, error } = await supabase
            .from('shipments')
            .select(`
                *,
                orders (
                    id,
                    status,
                    profiles (
                        full_name,
                        country
                    )
                )
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return { success: true, data }
    } catch (error: any) {
        console.error("Fetch Shipments Error:", error)
        return { success: false, error: error.message }
    }
}

export async function createShipment(formData: {
    order_id: string,
    tracking_number: string,
    freight_type: 'air' | 'sea',
    estimated_arrival?: string,
    origin_hub?: string,
    destination_hub?: string
}) {
    const supabase = getAdminClient()

    try {
        // 1. Create Shipment Record
        const { data: shipment, error: shipmentError } = await supabase
            .from('shipments')
            .insert({
                order_id: formData.order_id,
                tracking_number: formData.tracking_number,
                freight_type: formData.freight_type,
                status: 'received_at_hub', // Default start status
                origin_hub: formData.origin_hub || 'Georgia Hub',
                destination_hub: formData.destination_hub || 'Accra Pickup',
                estimated_arrival: formData.estimated_arrival
            })
            .select()
            .single()

        if (shipmentError) throw shipmentError

        // 2. Log Initial Event
        const { error: eventError } = await supabase
            .from('shipment_events')
            .insert({
                shipment_id: shipment.id,
                status: 'received_at_hub',
                location: formData.origin_hub || 'Georgia Hub',
                description: 'Shipment Created & Received at Origin Facility',
                occurred_at: new Date().toISOString()
            })

        if (eventError) console.error("Event Log Error (Non-fatal):", eventError)

        // 3. Notify Customer
        try {
            // Get customer ID from order
            const { data: order } = await supabase
                .from('orders')
                .select('user_id')
                .eq('id', formData.order_id)
                .single()

            if (order?.user_id) {
                await sendNotification({
                    userId: order.user_id,
                    title: 'Shipment Created',
                    message: `Your shipment has been created with tracking number ${formData.tracking_number}`,
                    type: 'order'
                })
            }
        } catch (notifyErr) {
            console.warn('Non-blocking notification failure:', notifyErr)
        }

        revalidatePath('/portal/admin/shipments')
        return { success: true, data: shipment }
    } catch (error: any) {
        console.error("Create Shipment Error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateShipmentStatus(
    shipmentId: string,
    newStatus: 'received_at_hub' | 'in_transit_air' | 'in_transit_sea' | 'clearing_customs' | 'ready_for_pickup' | 'delivered',
    location: string,
    description: string
) {
    const supabase = getAdminClient()

    try {
        // 1. Update Main Status
        const { error: updateError } = await supabase
            .from('shipments')
            .update({ status: newStatus })
            .eq('id', shipmentId)

        if (updateError) throw updateError

        // 2. Log History Event
        const { error: eventError } = await supabase
            .from('shipment_events')
            .insert({
                shipment_id: shipmentId,
                status: newStatus,
                location: location,
                description: description,
                occurred_at: new Date().toISOString()
            })

        if (eventError) throw eventError

        // 3. Notify Customer
        try {
            // Get customer ID from shipment's order
            const { data: shipment } = await supabase
                .from('shipments')
                .select('orders(user_id)')
                .eq('id', shipmentId)
                .single()

            const userId = (shipment?.orders as any)?.user_id
            if (userId) {
                await sendNotification({
                    userId,
                    title: 'Shipment Status Updated',
                    message: `${description}`,
                    type: 'order'
                })
            }
        } catch (notifyErr) {
            console.warn('Non-blocking notification failure:', notifyErr)
        }

        revalidatePath('/portal/admin/shipments')
        return { success: true }
    } catch (error: any) {
        console.error("Update Status Error:", error)
        return { success: false, error: error.message }
    }
}

// Fetch Eligible Orders (Paid/Processing) that don't have shipments yet?
// Or just allow searching orders.
// Fetch Eligible Orders (Paid/Processing) that don't have shipments yet?
// Or just allow searching orders.
export async function searchOrdersForShipment(query: string = '') {
    const supabase = getAdminClient()

    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                quotes ( total_amount, currency ),
                profiles ( full_name )
            `)
            .in('status', ['paid', 'processing']) // Only ship paid orders
            .order('created_at', { ascending: false })
            .limit(10)

        // Basic client-side filtering since we can't easily join-filter on profiles.full_name in supabase-js simple query
        // For production, an RPC or specific search index is better, but this works for small scale.
        const filtered = data?.filter(order =>
            (order.id || "").toLowerCase().includes(query.toLowerCase()) ||
            (Array.isArray(order.profiles)
                ? order.profiles[0]?.full_name || ""
                : (order.profiles as any)?.full_name || "").toLowerCase().includes(query.toLowerCase())
        ) || []

        if (error) throw error
        return { success: true, data: filtered }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Fetch Shipment History Events
export async function getShipmentEvents(shipmentId: string) {
    const supabase = getAdminClient()

    try {
        const { data, error } = await supabase
            .from('shipment_events')
            .select('*')
            .eq('shipment_id', shipmentId)
            .order('occurred_at', { ascending: false })

        if (error) throw error
        return { success: true, data }
    } catch (error: any) {
        console.error("Fetch Events Error:", error)
        return { success: false, error: error.message }
    }
}

// Fetch Shipment by Order ID (for Customer/Agent Portal)
export async function getShipmentByOrderId(orderId: string) {
    const supabase = getAdminClient()

    try {
        const { data, error } = await supabase
            .from('shipments')
            .select(`
                *,
                events:shipment_events (*)
            `)
            .eq('order_id', orderId)
            .single()

        if (error) {
            // It's normal to not find a shipment for every order
            if (error.code === 'PGRST116') return { success: true, data: null }
            throw error
        }

        return { success: true, data }
    } catch (error: any) {
        console.error("Fetch Shipment by Order Error:", error)
        return { success: false, error: error.message }
    }
}
