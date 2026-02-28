'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/portal/billing/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-slate-500 text-sm">Loading Hobort Billing...</p>
    </div>
  );
}
