'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Plan page removed — billing is now part of the HAPE portal subscription.
// Redirect to billing dashboard.
export default function PlanPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/portal/billing/dashboard');
  }, [router]);
  return null;
}
