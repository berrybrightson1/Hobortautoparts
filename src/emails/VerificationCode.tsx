import {
    Body,
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

interface VerificationCodeEmailProps {
    validationCode: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
    : 'https://hobortautopartsexpress.com';

const logoUrl = `${baseUrl}/Hobort auto express logo Main.png`;

export const VerificationCodeEmail = ({ validationCode = "123456" }: VerificationCodeEmailProps) => (
    <Html>
        <Head />
        <Preview>Your Hobort Auto Express verification code</Preview>
        <Body style={main}>
            <Container style={container}>
                {/* Top accent bar */}
                <Section style={accentBar} />

                {/* Header */}
                <Section style={header}>
                    <Img
                        src={logoUrl}
                        width="140"
                        height="auto"
                        alt="Hobort Auto Express"
                        style={logo}
                    />
                </Section>

                {/* Content */}
                <Section style={contentSection}>
                    <Text style={heading}>Confirm your email address</Text>
                    <Text style={text}>
                        Welcome to Hobort Auto Parts Express! To complete your registration, please enter the following 6-digit verification code:
                    </Text>

                    {/* Verification Code Block */}
                    <Section style={codeBlockContainer}>
                        <Text style={codeText}>{validationCode}</Text>
                    </Section>

                    <Text style={mutedText}>
                        This code will expire in 10 minutes. If you did not attempt to create an account, you can safely ignore this email.
                    </Text>
                </Section>

                <Hr style={hr} />

                {/* Footer */}
                <Section style={footerSection}>
                    <Img
                        src={logoUrl}
                        width="80"
                        height="auto"
                        alt="HAPE"
                        style={footerLogo}
                    />
                    <Text style={footerText}>
                        <a href={baseUrl} style={footerLink}>Hobort Auto Parts Express</a>
                        {' · '}
                        <a href={`${baseUrl}/contact`} style={footerLink}>Support</a>
                    </Text>
                    <Text style={footerMuted}>
                        Secure automated verification. Do not reply to this email.
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default VerificationCodeEmail;

// ── Styles ────────────────────────────────────────────────────────────────────

const main = {
    backgroundColor: '#f1f5f9',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
    margin: '40px auto',
    maxWidth: '580px',
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden' as const,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    backgroundColor: '#ffffff',
};

const accentBar = {
    backgroundColor: '#f97316',
    height: '5px',
    display: 'block' as const,
};

const header = {
    padding: '40px 48px 24px',
    textAlign: 'center' as const,
};

const logo = {
    margin: '0 auto',
    display: 'block',
};

const contentSection = {
    padding: '0 48px 40px',
    textAlign: 'center' as const,
};

const heading = {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 16px',
    letterSpacing: '-0.02em',
};

const text = {
    fontSize: '15px',
    color: '#475569',
    lineHeight: '1.6',
    margin: '0 0 32px',
};

const codeBlockContainer = {
    backgroundColor: '#f8fafc',
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    textAlign: 'center' as const,
};

const codeText = {
    fontSize: '36px',
    fontWeight: '800',
    color: '#f97316',
    letterSpacing: '0.25em',
    margin: '0',
    fontFamily: 'monospace',
};

const mutedText = {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: '0',
};

const hr = { borderColor: '#f1f5f9', margin: '0' };

const footerSection = {
    backgroundColor: '#f8fafc',
    padding: '32px 48px',
    textAlign: 'center' as const,
};

const footerLogo = {
    margin: '0 auto 16px',
    display: 'block',
    opacity: 0.4,
};

const footerText = {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '12px',
};

const footerMuted = {
    fontSize: '11px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: '0',
};

const footerLink = {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '500',
};
