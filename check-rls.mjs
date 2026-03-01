import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase credentials");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
    console.log("Fetching RLS policies for profiles table...");

    // We query pg_policies since supabase-js does not expose raw policies directly
    const { data, error } = await supabaseAdmin.rpc('get_table_policies', { table_name: 'profiles' });

    if (error) {
        // If RPC doesn't exist, we will have to ask the user to show the policies.
        console.error("Could not fetch via RPC. Creating a generic SQL command for the user to run.");
        console.log(`
Please run the following in your Supabase SQL Editor:

SELECT polname, cmd, qual, with_check 
FROM pg_policy 
WHERE polrelid = 'profiles'::regclass;
        `);
    } else {
        console.log("Policies:", data);
    }
}

checkPolicies();
