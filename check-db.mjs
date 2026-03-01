import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("Checking profiles table for roles...");
    const { data, error } = await supabase.from('profiles').select('id, role, full_name').order('created_at', { ascending: false }).limit(20);

    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Latest 10 profiles:");
        console.table(data);
    }
}

checkData();
