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

interface RequestUpdateEmailProps {
    firstName: string;
    partName: string;
    status: string;
    requestId: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
    : 'https://hobortautoparts.com';

export const RequestUpdateEmail = ({
    firstName,
    partName,
    status,
    requestId,
}: RequestUpdateEmailProps) => (
    <Html>
        <Head />
        <Preview>Update on your request for {partName}</Preview>
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
                <Text style={greeting}>Hi {firstName},</Text>
                <Text style={paragraph}>
                    There is an update on your sourcing request for <strong>{partName}</strong> (ID: {requestId.slice(0, 8)}).
                </Text>
                <Section style={statusCard}>
                    <Text style={statusLabel}>New Status</Text>
                    <Text style={statusValue}>{status.toUpperCase()}</Text>
                </Section>
                <Section style={btnSection}>
                    <Button style={button} href={`${baseUrl}/portal`}>
                        View Request Details
                    </Button>
                </Section>
                <Hr style={hr} />
                <Text style={footer}>
                    <a href={baseUrl} style={link}>Hobort Auto Parts Express</a>
                    <br />
                    This is an automated notification.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default RequestUpdateEmail;

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
    fontSize: '18px',
    lineHeight: '1.3',
    fontWeight: '700',
    color: '#0f172a',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#475569',
};

const statusCard = {
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    padding: '24px',
    marginTop: '24px',
    textAlign: 'center' as const,
    border: '1px solid #e2e8f0',
};

const statusLabel = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    margin: '0 0 8px',
};

const statusValue = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: '0',
};

const btnSection = {
    textAlign: 'center' as const,
    marginTop: '32px',
};

const button = {
    backgroundColor: '#2563eb',
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
