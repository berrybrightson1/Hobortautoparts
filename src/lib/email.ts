import { Resend } from 'resend'

// Initialize Resend with API key from environment
// If no key is provided (e.g. during build), it will throw at runtime if used, 
// but we allow initialization to pass for static generation safety.
const resendApiKey = process.env.RESEND_API_KEY

export const resend = new Resend(resendApiKey)

// Sender config
export const EMAIL_SENDER = {
    email: 'onboarding@resend.dev', // Default Resend test email. User needs to verify domain to change this.
    name: 'Hobort Auto Parts Express'
}

/**
 * Wrapper to send emails with standard error handling
 */
export async function sendEmail({
    to,
    subject,
    react,
    text
}: {
    to: string | string[],
    subject: string,
    react?: React.ReactElement,
    text?: string // Fallback or plain text
}) {
    if (!resendApiKey) {
        console.warn("RESEND_API_KEY is missing. Email not sent:", { to, subject })
        return { success: false, error: "Missing API Key" }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `${EMAIL_SENDER.name} <${EMAIL_SENDER.email}>`,
            to,
            subject,
            react,
            text
        })

        if (error) {
            console.error("Resend Error:", error)
            return { success: false, error }
        }

        return { success: true, data }
    } catch (error: any) {
        console.error("Email Send Exception:", error)
        return { success: false, error: error.message }
    }
}
