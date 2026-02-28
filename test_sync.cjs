const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: users, error: errorUsers } = await supabase.auth.admin.listUsers();
    if (errorUsers) {
        console.error("Error fetching users:", errorUsers);
        return;
    }
    const latestUser = users.users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    console.log("Latest user:", latestUser.id, latestUser.email);

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', latestUser.id).single();
    if (profileError) {
        console.log("Profile error:", profileError);
    } else {
        console.log("Found profile:", profile.id);
    }

    // Attempt upsert just like client
    const { data: newProfile, error: syncError } = await supabase
        .from('profiles')
        .upsert({
            id: latestUser.id,
            full_name: 'Test Name',
            role: 'customer',
        }, { onConflict: 'id' })
        .select()
        .single();
    if (syncError) {
        console.log("Sync error:", syncError);
    } else {
        console.log("Upsert success:", newProfile.id);
    }
}
check();
