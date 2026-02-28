/* eslint-disable */
import {
    Body,
    Button,
    Column,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Row,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface CustomerWelcomeProps {
    firstName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
    : 'https://hobortautopartsexpress.com';

const logoUrl = `${baseUrl}/Hobort auto express logo Main.png`;

export const CustomerWelcome = ({
    firstName = 'Customer',
}: CustomerWelcomeProps) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to Hobort Auto Parts Express — Your Gateway to Premium US Auto Parts!</Preview>
            <Body style={main}>
                <Container style={container}>

                    {/* Top accent bar */}
                    <Section style={accentBar} />

                    {/* Hero */}
                    <Section style={heroBanner}>
                        <Img src={logoUrl} width="160" height="auto" alt="Hobort Auto Express" style={logo} />
                        <Text style={heroEyebrow}>DIRECT FROM THE USA</Text>
                        <Text style={heroTitle}>Welcome to Hobort,{'\n'}{firstName}!</Text>
                        <Text style={heroSubtitle}>
                            Your gateway to premium US auto parts is now open. We eliminate the middlemen to connect you directly with authentic, quality parts right here from the United States, shipped fast and securely to Ghana.
                        </Text>
                        <Section style={ctaWrapper}>
                            <Button style={ctaButton} href={`${baseUrl}/portal/customer`}>
                                Open My Portal →
                            </Button>
                        </Section>
                    </Section>

                    {/* Body */}
                    <Section style={bodySection}>
                        <Text style={sectionLabel}>HOW IT WORKS</Text>
                        <Text style={sectionHeading}>3 simple steps to get your part</Text>

                        {/* Step cards */}
                        <Row style={stepsRow}>
                            <Column style={stepCol}>
                                <Section style={stepCard}>
                                    <Text style={stepNumber}>01</Text>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '8px auto' }}>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                    <Text style={stepTitle}>Submit a Request</Text>
                                    <Text style={stepDesc}>Enter your 17-digit VIN and part details into the portal.</Text>
                                </Section>
                            </Column>
                            <Column style={stepColSpacer} />
                            <Column style={stepCol}>
                                <Section style={stepCard}>
                                    <Text style={stepNumber}>02</Text>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '8px auto' }}>
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <Text style={stepTitle}>Approve Quote</Text>
                                    <Text style={stepDesc}>Receive a landed-cost quote from our US agents and approve it.</Text>
                                </Section>
                            </Column>
                            <Column style={stepColSpacer} />
                            <Column style={stepCol}>
                                <Section style={stepCard}>
                                    <Text style={stepNumber}>03</Text>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '8px auto' }}>
                                        <rect x="1" y="3" width="15" height="13" />
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                    <Text style={stepTitle}>Track Delivery</Text>
                                    <Text style={stepDesc}>Real-time tracking from our Atlanta Hub to your door in Ghana.</Text>
                                </Section>
                            </Column>
                        </Row>

                        {/* VIN Tip */}
                        <Section style={tipBanner}>
                            <Row>
                                <Column style={tipIconCol}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 16v-4" />
                                        <path d="M12 8h.01" />
                                    </svg>
                                </Column>
                                <Column>
                                    <Text style={tipTitle}>Pro tip: Have your VIN ready</Text>
                                    <Text style={tipDesc}>Have your 17-digit VIN ready. This ensures 100% fitment accuracy when our agents source your parts in the US.</Text>
                                </Column>
                            </Row>
                        </Section>

                        {/* Why HAPE */}
                        <Section style={highlightSection}>
                            <Text style={sectionLabel}>WHY CHOOSE HAPE</Text>

                            <Row style={featureRow}>
                                <Column style={featureIconCol}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', background: '#0b1f3a', borderRadius: 8, padding: 6 } as React.CSSProperties}>
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                </Column>
                                <Column style={featureTextCol}>
                                    <Text style={featureTitle}>Global Sourcing Network</Text>
                                    <Text style={featureDesc}>Certified US suppliers. Competitive pricing. Fast international delivery.</Text>
                                </Column>
                            </Row>
                            <Hr style={featureDivider} />
                            <Row style={featureRow}>
                                <Column style={featureIconCol}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', background: '#0b1f3a', borderRadius: 8, padding: 6 } as React.CSSProperties}>
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </Column>
                                <Column style={featureTextCol}>
                                    <Text style={featureTitle}>Live Order Tracking</Text>
                                    <Text style={featureDesc}>Know where your shipment is at every stage — from warehouse to delivery.</Text>
                                </Column>
                            </Row>
                            <Hr style={featureDivider} />
                            <Row style={featureRow}>
                                <Column style={featureIconCol}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', background: '#0b1f3a', borderRadius: 8, padding: 6 } as React.CSSProperties}>
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </Column>
                                <Column style={featureTextCol}>
                                    <Text style={featureTitle}>Dedicated Expert Support</Text>
                                    <Text style={featureDesc}>Your agent handles VIN lookups, sourcing, and your entire order end-to-end.</Text>
                                </Column>
                            </Row>
                        </Section>

                        {/* Secondary CTA */}
                        <Section style={secondaryCtaSection}>
                            <Text style={secondaryCtaText}>Ready to source your first part? It only takes 2 minutes.</Text>
                            <Button style={secondaryCta} href={`${baseUrl}/portal/customer`}>
                                Open My Portal
                            </Button>
                        </Section>
                    </Section>

                    <Hr style={hr} />

                    {/* Footer */}
                    <Section style={footerSection}>
                        <Img src={logoUrl} width="80" height="auto" alt="HAPE" style={footerLogo} />
                        <Text style={footerText}>
                            <a href={baseUrl} style={footerLink}>Hobort Auto Parts Express</a>
                            {' · '}
                            <a href={`${baseUrl}/portal/customer`} style={footerLink}>My Portal</a>
                            {' · '}
                            <a href={`${baseUrl}/contact`} style={footerLink}>Contact Us</a>
                        </Text>
                        <Text style={footerMuted}>
                            You're receiving this because you created an account at hobortautopartsexpress.com.{'\n'}If this wasn't you, you can safely ignore this email.
                        </Text>
                    </Section>

                </Container>
            </Body>
        </Html>
    );
};

export default CustomerWelcome;

// ── Styles ────────────────────────────────────────────────────────────────────

const main = {
    backgroundColor: '#f1f5f9',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
    margin: '32px auto',
    maxWidth: '680px',
    width: '100%',
    borderRadius: '20px',
    overflow: 'hidden' as const,
    boxShadow: '0 4px 40px rgba(0,0,0,0.10)',
};

const accentBar = {
    backgroundColor: '#f97316',
    height: '5px',
    display: 'block' as const,
};

const heroBanner = {
    backgroundColor: '#0b1f3a',
    padding: '56px 64px 52px',
    textAlign: 'center' as const,
};

const logo = { margin: '0 auto 24px', display: 'block' };

const heroEyebrow = {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.15em',
    color: '#f97316',
    textTransform: 'uppercase' as const,
    margin: '0 0 10px',
};

const heroTitle = {
    fontSize: '34px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 14px',
    lineHeight: '1.25',
    whiteSpace: 'pre-line' as const,
};

const heroSubtitle = {
    fontSize: '15px',
    color: '#94a3b8',
    lineHeight: '1.7',
    margin: '0 0 36px',
    maxWidth: '460px',
    marginLeft: 'auto',
    marginRight: 'auto',
};

const ctaWrapper = { textAlign: 'center' as const };

const ctaButton = {
    backgroundColor: '#f97316',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'inline-block',
    padding: '15px 40px',
    letterSpacing: '0.02em',
};

const bodySection = {
    backgroundColor: '#ffffff',
    padding: '48px 56px 40px',
};

const sectionLabel = {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.15em',
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    margin: '0 0 6px',
};

const sectionHeading = {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 28px',
};

const stepsRow = { marginBottom: '32px' };
const stepCol = { width: '30%', verticalAlign: 'top' as const };
const stepColSpacer = { width: '5%' };

const stepCard = {
    backgroundColor: '#f8fafc',
    borderRadius: '14px',
    padding: '20px 14px',
    border: '1px solid #e2e8f0',
    textAlign: 'center' as const,
};

const stepNumber = {
    fontSize: '10px',
    fontWeight: '800',
    color: '#f97316',
    letterSpacing: '0.1em',
    margin: '0 0 4px',
};

const stepTitle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '8px 0 4px',
};

const stepDesc = {
    fontSize: '11px',
    color: '#64748b',
    lineHeight: '1.55',
    margin: '0',
};

const tipBanner = {
    backgroundColor: '#fffbeb',
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid #fed7aa',
    marginBottom: '28px',
};

const tipIconCol = { width: '36px', verticalAlign: 'top' as const };

const tipTitle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#92400e',
    margin: '0 0 3px',
};

const tipDesc = {
    fontSize: '12px',
    color: '#b45309',
    lineHeight: '1.55',
    margin: '0',
};

const highlightSection = {
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    padding: '24px 28px 20px',
    border: '1px solid #e2e8f0',
    marginBottom: '32px',
};

const featureRow = { marginBottom: '4px' };
const featureDivider = { borderColor: '#e2e8f0', margin: '14px 0' };
const featureIconCol = { width: '44px', verticalAlign: 'middle' as const };
const featureTextCol = { verticalAlign: 'middle' as const, paddingLeft: '12px' };

const featureTitle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 2px',
};

const featureDesc = {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.5',
    margin: '0',
};

const secondaryCtaSection = {
    textAlign: 'center' as const,
    padding: '4px 0 8px',
};

const secondaryCtaText = {
    fontSize: '14px',
    color: '#475569',
    marginBottom: '16px',
};

const secondaryCta = {
    backgroundColor: '#0b1f3a',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
    padding: '13px 32px',
};

const hr = { borderColor: '#e2e8f0', margin: '0' };

const footerSection = {
    backgroundColor: '#f8fafc',
    padding: '28px 56px',
    textAlign: 'center' as const,
};

const footerLogo = {
    margin: '0 auto 12px',
    display: 'block',
    opacity: 0.35,
};

const footerText = { fontSize: '12px', color: '#64748b', marginBottom: '10px' };

const footerMuted = {
    fontSize: '11px',
    color: '#94a3b8',
    lineHeight: '1.7',
    whiteSpace: 'pre-line' as const,
};

const footerLink = { color: '#3b82f6', textDecoration: 'underline' };
