// Data service for Hobort Billing — uses Supabase for invoices, localStorage for settings
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logAction } from '@/lib/audit';
import { useAuth } from '@/components/auth/auth-provider';

// ─── Types ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'paid' | 'balance_due';

export interface LineItem {
  description: string;
  partNumber: string;
  rate: number;
  qty: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  lineItems: LineItem[];
  status: InvoiceStatus;
  createdAt: string;
  dueDate?: string;
  currency?: string;
  purchaseOrder?: string;
  paymentInstructions?: string;
  taxPercent?: number;
  discountAmount?: number;
  shippingFee?: number;
  exchangeRateAtPayment?: number;
}

export interface ExchangeRateEntry {
  date: string;
  rate: number;
  invoiceId: string;
  amountUsd: number;
}

export interface InvoiceNumberConfig {
  prefix: string;
  suffix: string;
  padLength: number;
}

export interface CompanyDetails {
  companyName: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  logoUrl?: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildInvoiceId(n: number, config: InvoiceNumberConfig): string {
  const pad = String(n).padStart(config.padLength, '0');
  return `${config.prefix}${pad}${config.suffix}`;
}

function lsKey(userId: string | undefined | null, suffix: string): string | null {
  return userId ? `hobort-billing-${userId}-${suffix}` : null;
}

function lsGet<T>(key: string | null, fallback: T): T {
  if (!key || typeof window === 'undefined') return fallback;
  try {
    const s = localStorage.getItem(key);
    return s ? { ...fallback as object, ...JSON.parse(s) } as T : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string | null, value: unknown): void {
  if (!key || typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// ─── useInvoices hook ────────────────────────────────────────────────────────

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Initial fetch
    supabase
      .from('billing_invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setInvoices(data.map(mapRow));
        }
        setLoading(false);
      });

    // Real-time subscription
    const channel = supabase
      .channel(`billing_invoices:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'billing_invoices', filter: `user_id=eq.${user.id}` },
        () => {
          // Re-fetch on any change
          supabase
            .from('billing_invoices')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
              if (data) setInvoices(data.map(mapRow));
            });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return { invoices, loading };
}

// Map Supabase snake_case row to Invoice interface
function mapRow(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string | undefined,
    customerAddress: row.customer_address as string | undefined,
    lineItems: (row.line_items ?? []) as LineItem[],
    status: row.status as InvoiceStatus,
    createdAt: row.created_at as string,
    dueDate: row.due_date as string | undefined,
    currency: row.currency as string | undefined,
    purchaseOrder: row.purchase_order as string | undefined,
    paymentInstructions: row.payment_instructions as string | undefined,
    taxPercent: row.tax_percent as number | undefined,
    discountAmount: row.discount_amount as number | undefined,
    shippingFee: row.shipping_fee as number | undefined,
    exchangeRateAtPayment: row.exchange_rate_at_payment as number | undefined,
  };
}

// Map Invoice to Supabase snake_case row
function toRow(invoice: Invoice, userId: string) {
  return {
    id: invoice.id,
    user_id: userId,
    customer_name: invoice.customerName,
    customer_email: invoice.customerEmail ?? null,
    customer_address: invoice.customerAddress ?? null,
    line_items: invoice.lineItems,
    status: invoice.status,
    created_at: invoice.createdAt,
    due_date: invoice.dueDate ?? null,
    currency: invoice.currency ?? null,
    purchase_order: invoice.purchaseOrder ?? null,
    payment_instructions: invoice.paymentInstructions ?? null,
    tax_percent: invoice.taxPercent ?? null,
    discount_amount: invoice.discountAmount ?? null,
    shipping_fee: invoice.shippingFee ?? null,
    exchange_rate_at_payment: invoice.exchangeRateAtPayment ?? null,
  };
}

// ─── dataOperations ──────────────────────────────────────────────────────────

/**
 * Get the current Supabase user synchronously.
 * For async operations it's fine — Supabase client caches the session.
 */
async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

export const dataOperations = {

  // Invoice number config (localStorage per user)
  getInvoiceNumberConfig(userId?: string): InvoiceNumberConfig {
    const key = lsKey(userId, 'invoice-number-config');
    return lsGet(key, { prefix: 'HBT', suffix: '', padLength: 4 });
  },

  setInvoiceNumberConfig(config: Partial<InvoiceNumberConfig>, userId?: string): void {
    const key = lsKey(userId, 'invoice-number-config');
    const current = this.getInvoiceNumberConfig(userId);
    lsSet(key, { ...current, ...config });
  },

  getNextInvoiceNum(userId?: string): number {
    const key = lsKey(userId, 'next-invoice-num');
    return lsGet<number>(key, 1) || 1;
  },

  setNextInvoiceNum(n: number, userId?: string): void {
    const key = lsKey(userId, 'next-invoice-num');
    lsSet(key, n);
  },

  getNextInvoiceIdPreview(invoices: Invoice[], userId?: string): string {
    const n = this.getNextInvoiceNum(userId);
    const config = this.getInvoiceNumberConfig(userId);
    const maxFromList = invoices.reduce((m, inv) => {
      const num = parseInt(inv.id.replace(/\D/g, ''), 10);
      return isNaN(num) ? m : Math.max(m, num);
    }, 0);
    const next = Math.max(n, maxFromList + 1);
    return buildInvoiceId(next, config);
  },

  async addInvoice(invoice: Omit<Invoice, 'id'> & { createdAt?: string }): Promise<Invoice> {
    const userId = await currentUserId();

    // Fetch all existing invoices for this user to determine the current max ID
    const { data: existingInvoices } = await supabase
      .from('billing_invoices')
      .select('id')
      .eq('user_id', userId);

    let maxNum = 0;
    if (existingInvoices && existingInvoices.length > 0) {
      maxNum = existingInvoices.reduce((m, inv) => {
        const num = parseInt((inv.id || '').replace(/\D/g, ''), 10);
        return isNaN(num) ? m : Math.max(m, num);
      }, 0);
    }

    const n = Math.max(this.getNextInvoiceNum(userId), maxNum + 1);
    const config = this.getInvoiceNumberConfig(userId);

    this.setNextInvoiceNum(n + 1, userId);
    const id = buildInvoiceId(n, config);

    const created: Invoice = {
      ...invoice,
      id,
      createdAt: invoice.createdAt ?? new Date().toISOString().slice(0, 10),
    };

    const { error } = await supabase.from('billing_invoices').insert(toRow(created, userId));
    if (error) throw new Error(error.message);

    logAction('create_invoice', { invoiceId: id, customerName: invoice.customerName }).catch(console.warn);

    // Fire real-time notification
    supabase.from('notifications').insert({
      user_id: userId,
      title: 'Invoice Created',
      message: `Invoice ${id} for ${invoice.customerName} has been created.`,
      type: 'order',
      read: false,
    }).then(({ error: ne }) => { if (ne) console.warn('Notification insert error:', ne.message); });

    return created;
  },

  async setInvoiceStatus(id: string, status: InvoiceStatus, options?: { exchangeRate?: number }): Promise<void> {
    const userId = await currentUserId();
    const update: Record<string, unknown> = { status };
    if (options?.exchangeRate != null) update.exchange_rate_at_payment = options.exchangeRate;
    // Always filter by user_id in addition to id — prevents cross-user mutation
    const { error } = await supabase.from('billing_invoices').update(update).eq('id', id).eq('user_id', userId);
    if (error) throw new Error(error.message);

    logAction('update_invoice_status', { invoiceId: id, status }).catch(console.warn);

    // Fire real-time notification
    const statusLabel = status === 'paid' ? 'Paid ✓' : 'Balance Due';
    supabase.from('notifications').insert({
      user_id: userId,
      title: 'Invoice Status Updated',
      message: `Invoice ${id} has been marked as ${statusLabel}.`,
      type: 'system',
      read: false,
    }).then(({ error: ne }) => { if (ne) console.warn('Notification insert error:', ne.message); });
  },

  async updateInvoice(id: string, payload: Partial<Omit<Invoice, 'id'>>): Promise<void> {
    const userId = await currentUserId();
    // Map camelCase payload keys to snake_case
    const mapped: Record<string, unknown> = {};
    if (payload.customerName !== undefined) mapped.customer_name = payload.customerName;
    if (payload.customerEmail !== undefined) mapped.customer_email = payload.customerEmail;
    if (payload.customerAddress !== undefined) mapped.customer_address = payload.customerAddress;
    if (payload.lineItems !== undefined) mapped.line_items = payload.lineItems;
    if (payload.status !== undefined) mapped.status = payload.status;
    if (payload.dueDate !== undefined) mapped.due_date = payload.dueDate;
    if (payload.currency !== undefined) mapped.currency = payload.currency;
    if (payload.purchaseOrder !== undefined) mapped.purchase_order = payload.purchaseOrder;
    if (payload.paymentInstructions !== undefined) mapped.payment_instructions = payload.paymentInstructions;
    if (payload.taxPercent !== undefined) mapped.tax_percent = payload.taxPercent;
    if (payload.discountAmount !== undefined) mapped.discount_amount = payload.discountAmount;
    if (payload.shippingFee !== undefined) mapped.shipping_fee = payload.shippingFee;

    // Filter by both id AND user_id — cross-user writes blocked at client layer too
    const { error } = await supabase.from('billing_invoices').update(mapped).eq('id', id).eq('user_id', userId);
    if (error) throw new Error(error.message);

    logAction('update_invoice', { invoiceId: id, fields: Object.keys(mapped) }).catch(console.warn);
  },

  async deleteInvoice(id: string): Promise<void> {
    const userId = await currentUserId();
    // Filter by both id AND user_id — prevents cross-user deletion even if RLS misconfigured
    const { error } = await supabase.from('billing_invoices').delete().eq('id', id).eq('user_id', userId);
    if (error) throw new Error(error.message);

    logAction('delete_invoice', { invoiceId: id }).catch(console.warn);

    // Fire real-time notification
    supabase.from('notifications').insert({
      user_id: userId,
      title: 'Invoice Deleted',
      message: `Invoice ${id} has been permanently deleted.`,
      type: 'system',
      read: false,
    }).then(({ error: ne }) => { if (ne) console.warn('Notification insert error:', ne.message); });
  },

  // ─── Settings (localStorage keyed by Supabase userId) ────────────────────

  getCompanyDetails(userId?: string): CompanyDetails {
    const key = lsKey(userId, 'company');
    return lsGet(key, { companyName: '', address: '', phone: '', website: '', email: '' });
  },

  setCompanyDetails(details: Partial<CompanyDetails>, userId?: string): void {
    const key = lsKey(userId, 'company');
    lsSet(key, { ...this.getCompanyDetails(userId), ...details });
  },

  getBankDetails(userId?: string): BankDetails {
    const key = lsKey(userId, 'bank');
    return lsGet(key, { bankName: '', accountNumber: '', accountName: '' });
  },

  setBankDetails(details: BankDetails, userId?: string): void {
    const key = lsKey(userId, 'bank');
    lsSet(key, details);
  },

  getTerms(userId?: string): string[] {
    const key = lsKey(userId, 'terms');
    if (!key || typeof window === 'undefined') return [];
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  },

  setTerms(terms: string[], userId?: string): void {
    const key = lsKey(userId, 'terms');
    lsSet(key, terms);
  },

  getLogoUrl(userId?: string): string | null {
    const key = lsKey(userId, 'logo');
    if (key && typeof window !== 'undefined') {
      try {
        const uploaded = localStorage.getItem(key);
        if (uploaded) return uploaded;
      } catch { /* ignore */ }
    }
    const company = this.getCompanyDetails(userId);
    return company?.logoUrl?.trim() || null;
  },

  setLogoUrl(dataUrl: string | null, userId?: string): void {
    const key = lsKey(userId, 'logo');
    if (!key || typeof window === 'undefined') return;
    try {
      if (dataUrl) {
        // Guard against oversized base64 images filling localStorage quota (~1MB limit)
        if (dataUrl.length > 1_000_000) {
          console.warn('Logo image too large for localStorage — compress before uploading');
          return;
        }
        localStorage.setItem(key, dataUrl);
      } else {
        localStorage.removeItem(key);
      }
    } catch { /* ignore */ }
  },
};
