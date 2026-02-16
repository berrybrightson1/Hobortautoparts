
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function testFetch() {
    // 1. First, get a user to simulate (we need a valid user ID)
    // Since we can't easily login as a specific user without password in this script,
    // we might need to use the service role key to bypass RLS for the INITIAL fetch of a user ID,
    // but then we want to test RLS.
    // actually, let's just try to fetch assuming we are anon (which will fail RLS if no public access)
    // OR, better, let's use the service role key to fetch a user, sign them in (if possible) or just impersonate?
    // Easier: execute the query with service role key first to see if structure is correct.
    // If structure is correct, then it's RLS.

    console.log("Testing Query Structure with Service Role (Bypassing RLS)...")
    const srKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!srKey) {
        console.error("No service role key found for structure test.")
        return
    }
    const adminClient = createClient(supabaseUrl!, srKey)

    // Get a random user ID from an order to test with
    const { data: order } = await adminClient.from('orders').select('user_id').limit(1).single()

    if (!order) {
        console.log("No orders found to test with.")
        return
    }

    const userId = order.user_id
    console.log(`Testing with User ID: ${userId}`)

    const { data, error } = await adminClient
        .from('shipments')
        .select(`
          *,
          orders!inner (
              user_id,
              quotes (
                  sourcing_requests (part_name)
              )
          )
      `)
        .eq('orders.user_id', userId)
        .limit(1)

    if (error) {
        console.error("Query Error (Structure/Relationship):", JSON.stringify(error, null, 2))
    } else {
        console.log("Query Structure Valid. Data:", JSON.stringify(data, null, 2))
    }
}

testFetch()
