"use server"

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function createProxyOrder(request: {
    userId: string
    agentId: string
    quoteId: string
    requestId: string
}) {
    if (!supabaseServiceKey) {
        throw new Error("Server configuration error: Missing Service Role Key")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    })

    try {
        console.log('--- EXECUTING SERVER ACTION: CREATE PROXY ORDER ---')

        // 1. Create the order
        const { error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: request.userId,
                quote_id: request.quoteId,
                agent_id: request.agentId,
                status: 'pending_payment',
                payment_method: 'Client Cash/Transfer (Pending Verification)'
            })

        if (orderError) {
            console.error('Server Action Order Error:', orderError)
            throw new Error(`Order Creation Failed: ${orderError.message}`)
        }

        // 2. Update the request status
        const { error: requestError } = await supabase
            .from('sourcing_requests')
            .update({ status: 'processing' })
            .eq('id', request.requestId)

        if (requestError) {
            console.error('Server Action Request Update Error:', requestError)
            // Note: Order was created, but request status failed. 
            // We might want to rollback, but for now we just throw.
            throw new Error(`Request Update Failed: ${requestError.message}`)
        }

        return { success: true }

    } catch (error: any) {
        console.error('Server Action Fatal Error:', error)
        return { success: false, error: error.message }
    }
}
