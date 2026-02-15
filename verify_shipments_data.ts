import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkData() {
    console.log('START_OUTPUT')

    // Ships
    const { count: shipmentCount, error: shipmentError } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })

    if (shipmentError) {
        console.log('SHIPMENT_ERROR: ' + shipmentError.message)
    } else {
        console.log('TOTAL_SHIPMENTS: ' + shipmentCount)
    }

    // Orders Stats
    const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('status')

    if (orderError) {
        console.log('ORDER_ERROR: ' + orderError.message)
    } else {
        const counts: Record<string, number> = {}
        orders?.forEach(o => {
            counts[o.status] = (counts[o.status] || 0) + 1
        })
        console.log('ORDER_STATUSES: ' + JSON.stringify(counts))
    }

    // Eligible
    const { data: eligible, error: eligibleError } = await supabase
        .from('orders')
        .select('id, status, created_at')
        .in('status', ['paid', 'processing'])
        .order('created_at', { ascending: false })
        .limit(5)

    if (eligibleError) {
        console.log('ELIGIBLE_ERROR: ' + eligibleError.message)
    } else {
        console.log('ELIGIBLE_COUNT: ' + (eligible?.length || 0))
        if (eligible?.length) {
            console.log('ELIGIBLE_IDS: ' + eligible.map(o => `${o.id} (${o.status})`).join(', '))
        }
    }

    console.log('END_OUTPUT')
}

checkData()
