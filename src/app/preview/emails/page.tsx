import { notFound } from 'next/navigation';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { CustomerWelcome } from '@/emails/CustomerWelcome';
import { AgentWelcome } from '@/emails/AgentWelcome';
import { RequestUpdateEmail } from '@/emails/RequestUpdateEmail';
import React from 'react';

// Dev-only email preview — hidden in production (returns 404)
// Local: http://localhost:3050/preview/emails

const TEMPLATES = {
    'Welcome Email (Post-Signup)': () => <WelcomeEmail firstName="Clifford" />,
    'Customer Welcome': () => <CustomerWelcome firstName="Clifford" />,
    'Agent Welcome': () => <AgentWelcome firstName="Alex" />,
    'Request Update': () => (
        <RequestUpdateEmail
            firstName="Clifford"
            partName="Rear Brake Pad Set"
            status="Shipped"
            requestId="req_abc123xyz"
        />
    ),
};

type TemplateName = keyof typeof TEMPLATES;
const DEFAULT: TemplateName = 'Welcome Email (Post-Signup)';

export default async function EmailPreviewPage({
    searchParams,
}: {
    searchParams: Promise<{ template?: string }>;
}) {
    // Hidden in production — only available in development
    if (process.env.NODE_ENV !== 'development') {
        notFound();
    }

    const params = await searchParams;
    const selected = (params.template as TemplateName) || DEFAULT;
    const factory = TEMPLATES[selected] ?? TEMPLATES[DEFAULT];
    const html = await render(factory());

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <aside style={{ width: 240, borderRight: '1px solid #e2e8f0', padding: '24px 16px', background: '#f8fafc', flexShrink: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16 }}>
                    Email Templates
                </p>
                {(Object.keys(TEMPLATES) as TemplateName[]).map((name) => (
                    <a
                        key={name}
                        href={`/preview/emails?template=${encodeURIComponent(name)}`}
                        style={{
                            display: 'block',
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: selected === name ? 700 : 500,
                            color: selected === name ? '#f97316' : '#475569',
                            background: selected === name ? '#fff7ed' : 'transparent',
                            textDecoration: 'none',
                            marginBottom: 4,
                            border: selected === name ? '1px solid #fed7aa' : '1px solid transparent',
                        }}
                    >
                        {name}
                    </a>
                ))}
                <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: '1.5' }}>
                        Dev-only preview. Hidden in production.
                    </p>
                </div>
            </aside>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{selected}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: 99 }}>Preview</span>
                </div>
                <iframe srcDoc={html} style={{ flex: 1, border: 'none', background: '#f1f5f9' }} title="Email Preview" />
            </main>
        </div>
    );
}
