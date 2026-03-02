import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface NewDeviceEmailProps {
    firstName: string;
    deviceName: string;
    location: string;
    time: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
    : 'https://hobortautopartsexpress.com';

const logoUrl = `${baseUrl}/Hobort auto express logo Main.png`;

export const NewDeviceEmail = ({
    firstName = 'Customer',
    deviceName = 'Unknown Device',
    location = 'Unknown Location',
    time = new Date().toLocaleString(),
}: NewDeviceEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Security Alert: New sign-in to your Hobort account</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Top accent bar */}
                    <Section style={accentBar} />

                    <Section style={heroBanner}>
                        <Img src={logoUrl} width="160" height="auto" alt="Hobort Auto Express" style={logo} />
                        <Text style={heroTitle}>New Sign-In Detected</Text>
                    </Section>

                    <Section style={bodySection}>
                        <Text style={greeting}>Hi {firstName},</Text>
                        <Text style={text}>
                            We noticed a new sign-in to your Hobort account from a device we don't recognize.
                        </Text>

                        <Section style={detailsBox}>
                            <Text style={detailsText}><strong>Device:</strong> {deviceName}</Text>
                            <Text style={detailsText}><strong>Location:</strong> {location}</Text>
                            <Text style={detailsText}><strong>Time:</strong> {time}</Text>
                        </Section>

                        <Text style={text}>
                            If this was you, you can safely ignore this email.
                        </Text>
                        <Text style={text}>
                            <strong>If you didn't do this, please secure your account immediately by resetting your password.</strong>
                        </Text>

                        <Section style={ctaWrapper}>
                            <Button style={ctaButton} href={`${baseUrl}/forgot-password`}>
                                Reset Password
                            </Button>
                        </Section>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footerSection}>
                        <Text style={footerText}>
                            <a href={baseUrl} style={footerLink}>Hobort Auto Parts Express</a>
                        </Text>
                        <Text style={footerMuted}>
                            This is an automated security notification. Please do not reply to this email.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default NewDeviceEmail;

// ── Styles ────────────────────────────────────────────────────────────────────
const main = { backgroundColor: '#f1f5f9', fontFamily: '"Inter", -apple-system, sans-serif' };
const container = { margin: '32px auto', maxWidth: '680px', width: '100%', borderRadius: '20px', overflow: 'hidden' as const, boxShadow: '0 4px 40px rgba(0,0,0,0.10)', backgroundColor: '#ffffff' };
const accentBar = { backgroundColor: '#ef4444', height: '5px', display: 'block' as const };
const heroBanner = { backgroundColor: '#0b1f3a', padding: '40px 64px', textAlign: 'center' as const };
const logo = { margin: '0 auto 24px', display: 'block' };
const heroTitle = { fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: '0' };
const bodySection = { padding: '40px 56px' };
const greeting = { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px' };
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px' };
const detailsBox = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', margin: '24px 0' };
const detailsText = { fontSize: '14px', color: '#334155', margin: '0 0 8px', lineHeight: '1.4' };
const ctaWrapper = { textAlign: 'center' as const, margin: '32px 0 16px' };
const ctaButton = { backgroundColor: '#ef4444', borderRadius: '8px', color: '#ffffff', fontSize: '15px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', padding: '12px 32px' };
const hr = { borderColor: '#e2e8f0', margin: '0' };
const footerSection = { backgroundColor: '#f8fafc', padding: '28px 56px', textAlign: 'center' as const };
const footerText = { fontSize: '12px', color: '#64748b', marginBottom: '10px' };
const footerLink = { color: '#3b82f6', textDecoration: 'underline' };
const footerMuted = { fontSize: '11px', color: '#94a3b8', lineHeight: '1.6' };
