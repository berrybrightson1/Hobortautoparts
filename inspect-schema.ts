
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for schema inspection

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function inspectSchema() {
    console.log("Inspecting Quote Relationships...")

    // We can't easily query internal schema tables via JS client without specific permissions or using RPC.
    // Instead, let's just fetch a Quote and see what it returns.

    const { data: quote, error } = await supabase
        .from('quotes')
        .select('*')
        .limit(1)
        .single()

    if (error) {
        console.error("Error fetching quote:", error)
        return
    }

    console.log("Sample Quote Data:", quote)

    // Check if sourcing_request_id exists
    if (quote.sourcing_request_id) {
        console.log(`Found sourcing_request_id: ${quote.sourcing_request_id}. Testing join...`)

        const { data: joinData, error: joinError } = await supabase
            .from('quotes')
            .select('*, sourcing_requests(*)')
            .eq('id', quote.id)
            .single()

        if (joinError) {
            console.error("Join Error (sourcing_requests):", joinError)
        } else {
            console.log("Join Successful:", joinData)
        }
    } else {
        console.log("No sourcing_request_id found on quote.")
    }
}

inspectSchema()
