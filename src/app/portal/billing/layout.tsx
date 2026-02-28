import type { Metadata } from 'next';
import { BillingNotificationProvider } from '@/components/billing/BillingNotificationProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Hobort Billing | Hobort Auto Express',
  description: 'Professional invoicing for your business',
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BillingNotificationProvider />
      <Toaster position="top-right" richColors />
    </>
  );
}
