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

interface WelcomeEmailProps {
    firstName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
    : 'https://hobortautoparts.com';

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => (
    <Html>
        <Head />
        <Preview>Welcome to Hobort Auto Parts Express!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={logoSection}>
                    <Img
                        src={`${baseUrl}/logo.png`}
                        width="150"
                        height="auto"
                        alt="Hobort Auto Express"
                    />
                </Section>
                <Text style={greeting}>Welcome {firstName}</Text>
                <Text style={paragraph}>
                    Hobort Auto Parts Express is your premium gateway to sourcing high-quality auto parts globally with real-time tracking and expert support.
                </Text>
                <Section style={btnSection}>
                    <Button style={button} href={`${baseUrl}/quote`}>
                        Place Your First Request
                    </Button>
                </Section>
                <Hr style={hr} />
                <Text style={footer}>
                    <a href={baseUrl} style={link}>Hobort Auto Parts Express</a>
                    <br />
                    If you didn't sign up for this account, you can safely ignore this email.
                    <br />
                    <a href="#" style={link}>Unsubscribe</a>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default WelcomeEmail;

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
};

const logoSection = {
    padding: '32px 0',
    textAlign: 'center' as const,
};

const greeting = {
    fontSize: '24px',
    lineHeight: '1.3',
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center' as const,
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#475569',
    textAlign: 'center' as const,
};

const btnSection = {
    textAlign: 'center' as const,
    marginTop: '32px',
};

const button = {
    backgroundColor: '#f97316',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 32px',
};

const hr = {
    borderColor: '#e2e8f0',
    margin: '40px 0',
};

const footer = {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: '22px',
    textAlign: 'center' as const,
};

const link = {
    color: '#3b82f6',
    textDecoration: 'underline',
};
