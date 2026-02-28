'use client';

import { useAuth as useHapeAuth } from '@/components/auth/auth-provider';

/**
 * Billing auth hook — delegates to the HAPE portal's Supabase auth context.
 * The `tier` concept maps to the user's Supabase role for now.
 */
export function useAuth() {
  const { user, profile, loading } = useHapeAuth();

  // Map HAPE roles to billing tiers
  const tier = profile?.role === 'admin' ? 'pro' : 'hobort_shipper';

  return { user, loading, tier };
}
