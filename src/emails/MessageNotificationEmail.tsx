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

interface MessageNotificationEmailProps {
    firstName: string;
    messagePreview: string;
    senderName: string;
    linkUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
    : 'https://hobortautopartsexpress.com';

const logoUrl = `${baseUrl}/Hobort auto express logo Main.png`;

export const MessageNotificationEmail = ({
    firstName = 'Customer',
    messagePreview = 'Hello, this is a message from the team.',
    senderName = 'Hobort Support',
    linkUrl = `${baseUrl}/portal/customer`,
}: MessageNotificationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>New message from {senderName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Top accent bar */}
                    <Section style={accentBar} />

                    <Section style={heroBanner}>
                        <Img src={logoUrl} width="160" height="auto" alt="Hobort Auto Express" style={logo} />
                        <Text style={heroTitle}>New Message</Text>
                    </Section>

                    <Section style={bodySection}>
                        <Text style={greeting}>Hi {firstName},</Text>
                        <Text style={text}>
                            You have received a new message regarding your auto parts request/order.
                        </Text>

                        <Section style={messageBox}>
                            <Text style={messageSender}>{senderName} says:</Text>
                            <Text style={messageContent}>"{messagePreview}..."</Text>
                        </Section>

                        <Section style={ctaWrapper}>
                            <Button style={ctaButton} href={linkUrl}>
                                Reply in Portal
                            </Button>
                        </Section>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footerSection}>
                        <Text style={footerText}>
                            <a href={baseUrl} style={footerLink}>Hobort Auto Parts Express</a>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default MessageNotificationEmail;

// ── Styles ────────────────────────────────────────────────────────────────────
const main = { backgroundColor: '#f1f5f9', fontFamily: '"Inter", -apple-system, sans-serif' };
const container = { margin: '32px auto', maxWidth: '680px', width: '100%', borderRadius: '20px', overflow: 'hidden' as const, boxShadow: '0 4px 40px rgba(0,0,0,0.10)', backgroundColor: '#ffffff' };
const accentBar = { backgroundColor: '#f59e0b', height: '5px', display: 'block' as const };
const heroBanner = { backgroundColor: '#0b1f3a', padding: '40px 64px', textAlign: 'center' as const };
const logo = { margin: '0 auto 24px', display: 'block' };
const heroTitle = { fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: '0' };
const bodySection = { padding: '40px 56px' };
const greeting = { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px' };
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px' };
const messageBox = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '24px', borderLeft: '4px solid #f97316', margin: '24px 0' };
const messageSender = { fontSize: '13px', fontWeight: '700', color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase' as const };
const messageContent = { fontSize: '16px', color: '#0f172a', margin: '0', fontStyle: 'italic' };
const ctaWrapper = { textAlign: 'center' as const, margin: '32px 0 16px' };
const ctaButton = { backgroundColor: '#0b1f3a', borderRadius: '8px', color: '#ffffff', fontSize: '15px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', padding: '12px 32px' };
const hr = { borderColor: '#e2e8f0', margin: '0' };
const footerSection = { backgroundColor: '#f8fafc', padding: '28px 56px', textAlign: 'center' as const };
const footerText = { fontSize: '12px', color: '#64748b', marginBottom: '10px' };
const footerLink = { color: '#3b82f6', textDecoration: 'underline' };
