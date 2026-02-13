import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
    const timestamp = Date.now()
    const email = `test.agent.${timestamp}@gmail.com`
    const company = `TestCompany${timestamp}`

    console.log(`\n🧪 Testing Agent Signup (No Email Confirmation)`)
    console.log(`📧 Email: ${email}`)
    console.log(`🏢 Company: ${company}\n`)

    const { data, error } = await supabase.auth.signUp({
        email,
        password: 'SecurePassword123!',
        options: {
            data: {
                full_name: 'Test Agent User',
                role: 'agent',
                company_name: company
            }
        }
    })

    if (error) {
        console.error("❌ Signup FAILED")
        console.error("Error:", error.message)
        console.error("Code:", error.code)
        process.exit(1)
    } else {
        console.log("✅ Signup SUCCESS!")
        console.log("User ID:", data.user?.id)
        console.log("Email:", data.user?.email)
        console.log("Role:", data.user?.user_metadata?.role)
        console.log("Confirmed:", data.user?.email_confirmed_at ? "Yes" : "No (but should work anyway)")

        // Check if profile was created
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user?.id)
            .single()

        if (profileError) {
            console.error("\n⚠️  Profile check failed:", profileError.message)
        } else {
            console.log("\n✅ Profile created successfully!")
            console.log("Profile role:", profile.role)
            console.log("Full name:", profile.full_name)
        }
    }
}

testSignup()
