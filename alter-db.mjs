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

async function alterEnum() {
    console.log("Attempting to add 'pending_agent' to user_role ENUM via SQL RPC...");
    // We cannot directly execute ALTER TYPE with regular supabase queries. 
    // Need to check if there is an RPC or just let the user know they need to update it via dashboard.
    // Wait, I can try to run standard SQL if there's an RPC, or just give the user the exact SQL command.

    console.log("Since Supabase REST API doesn't allow direct DDL (ALTER TYPE), please run this in the Supabase SQL Editor:");
    console.log("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'pending_agent';");
}

alterEnum();
