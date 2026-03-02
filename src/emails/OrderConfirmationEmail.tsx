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

interface OrderConfirmationEmailProps {
    firstName: string;
    orderId: string;
    amount: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
    : 'https://hobortautopartsexpress.com';

const logoUrl = `${baseUrl}/Hobort auto express logo Main.png`;

export const OrderConfirmationEmail = ({
    firstName = 'Customer',
    orderId = 'ORD-000000',
    amount = '$0.00',
}: OrderConfirmationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Order Confirmation: Your order {orderId} is confirmed!</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Top accent bar */}
                    <Section style={accentBar} />

                    <Section style={heroBanner}>
                        <Img src={logoUrl} width="160" height="auto" alt="Hobort Auto Express" style={logo} />
                        <Text style={heroTitle}>Order Confirmed!</Text>
                    </Section>

                    <Section style={bodySection}>
                        <Text style={greeting}>Hi {firstName},</Text>
                        <Text style={text}>
                            Thank you for your order! We've received your payment of {amount} for order {orderId}.
                        </Text>
                        <Text style={text}>
                            Our team is already working on fulfilling your order. You'll receive another email as soon as it ships.
                        </Text>

                        <Section style={ctaWrapper}>
                            <Button style={ctaButton} href={`${baseUrl}/portal/customer/orders`}>
                                View Order Details
                            </Button>
                        </Section>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footerSection}>
                        <Text style={footerText}>
                            <a href={baseUrl} style={footerLink}>Hobort Auto Parts Express</a>
                        </Text>
                        <Text style={footerMuted}>
                            Thank you for choosing Hobort Auto Express!
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default OrderConfirmationEmail;

// ── Styles ────────────────────────────────────────────────────────────────────
const main = { backgroundColor: '#f1f5f9', fontFamily: '"Inter", -apple-system, sans-serif' };
const container = { margin: '32px auto', maxWidth: '680px', width: '100%', borderRadius: '20px', overflow: 'hidden' as const, boxShadow: '0 4px 40px rgba(0,0,0,0.10)', backgroundColor: '#ffffff' };
const accentBar = { backgroundColor: '#10b981', height: '5px', display: 'block' as const };
const heroBanner = { backgroundColor: '#0b1f3a', padding: '40px 64px', textAlign: 'center' as const };
const logo = { margin: '0 auto 24px', display: 'block' };
const heroTitle = { fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: '0' };
const bodySection = { padding: '40px 56px' };
const greeting = { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px' };
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px' };
const ctaWrapper = { textAlign: 'center' as const, margin: '32px 0 16px' };
const ctaButton = { backgroundColor: '#f97316', borderRadius: '8px', color: '#ffffff', fontSize: '15px', fontWeight: '600', textDecoration: 'none', display: 'inline-block', padding: '12px 32px' };
const hr = { borderColor: '#e2e8f0', margin: '0' };
const footerSection = { backgroundColor: '#f8fafc', padding: '28px 56px', textAlign: 'center' as const };
const footerText = { fontSize: '12px', color: '#64748b', marginBottom: '10px' };
const footerLink = { color: '#3b82f6', textDecoration: 'underline' };
const footerMuted = { fontSize: '11px', color: '#94a3b8', lineHeight: '1.6' };
