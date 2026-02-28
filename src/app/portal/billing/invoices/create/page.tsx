'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useInvoices, dataOperations } from '@/lib/billing/data/useData';
import { useToast } from '@/lib/billing/toast/useToast';
import { useAuth } from '@/lib/billing/firebase/useAuth';
import { useAuth as useAppAuth } from '@/components/auth/auth-provider';
import AppLayout from '@/components/billing/AppLayout';
import OnboardingModal from '@/components/billing/OnboardingModal';
import CurrencyDropdown, { type CurrencyOption } from '@/components/billing/CurrencyDropdown';
import PresetDropdown from '@/components/billing/PresetDropdown';
import styles from './create.module.css';

const ONBOARDING_DISMISSED_KEY = 'create-onboarding-dismissed';
const SETUP_REMINDER_SHOWN_KEY = 'create-setup-reminder-shown';
const LAST_INVOICE_DATA_KEY = 'last-invoice-data';

const FREE_TIER_MAX_INVOICES = 3;
const FREE_TIER_MAX_DRAFTS = 2;

const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', label: 'US dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British pound' },
  { code: 'GHS', label: 'Ghanaian cedi' },
];

interface LineItem {
  description: string;
  partNumber: string;
  rate: number;
  qty: number;
  total: number;
}

interface LastInvoiceData {
  currency: string;
  paymentInstructions: string;
  taxPercent: number;
  discountAmount: number;
  shippingFee: number;
  lineItems: LineItem[];
}

function newLine(): LineItem {
  return { description: '', partNumber: '', rate: 0, qty: 0, total: 0 };
}

function dateToString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, tier } = useAuth();
  const { profile } = useAppAuth();
  const { invoices, loading } = useInvoices();
  const { showToast } = useToast();

  const isAdmin = profile?.role === 'admin';
  const defaultLogoUrl = '/Hobort auto express logo Main.png';
  const defaultCompanyName = 'HOBORT AUTO PARTS EXPRESS';
  const defaultAddress = '815 Progress Ct Ste B Lawrenceville, GA 30043';
  const defaultPhone = '+1 678 496 6882';
  const defaultWebsite = 'https://www.hobortautopartsexpress.com';
  const defaultEmail = 'info@hobortautopartsexpress.com';
  const defaultBankName = 'GT BANK Labone Branch';
  const defaultAccountNumber = 'Cedi account -3226001001656';
  const defaultAccountName = 'Hobort Shipping';
  const defaultTerms = [
    '1. Hobort Auto Parts Express operates as a sourcing and logistics service provider.',
    '2. Shipping to Ghana is not included in this invoice and will be confirmed upon receipt of parts at our warehouse.',
    '3. Full payment is required before parts are purchased from suppliers.',
    '4. Any warranty provided is strictly that of the original supplier or manufacturer.',
    '5. Customer is responsible for confirming compatibility (VIN, part number, trim, specifications).',
    '6. Delivery timelines are estimates and may be affected by supplier or customs delays.'
  ];

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingDraft, setDeletingDraft] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [purchaseOrder, setPurchaseOrder] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(dateToString(new Date()));
  const [dueDate, setDueDate] = useState(dateToString(new Date(Date.now() + 14 * 86400000)));
  const [currency, setCurrency] = useState('USD');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [taxPercent, setTaxPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([newLine()]);

  const nextInvoiceId = useMemo(() => {
    const nums = invoices
      .map((inv) => {
        const match = inv.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    const nextNum = maxNum + 1;
    return `INV${String(nextNum).padStart(4, '0')}`;
  }, [invoices]);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [company, setCompany] = useState<any>({});
  const [bank, setBank] = useState<any>({});
  const [terms, setTerms] = useState<string[]>([]);

  // Load setup data on mount and when user changes
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;

    try {
      const existingLogo = dataOperations.getLogoUrl();
      setLogoUrl(existingLogo || (isAdmin ? defaultLogoUrl : null));

      const comp = dataOperations.getCompanyDetails();
      setCompany({
        companyName: comp.companyName || (isAdmin ? defaultCompanyName : ''),
        address: comp.address || (isAdmin ? defaultAddress : ''),
        phone: comp.phone || (isAdmin ? defaultPhone : ''),
        website: comp.website || (isAdmin ? defaultWebsite : ''),
        email: comp.email || (isAdmin ? defaultEmail : ''),
        logoUrl: comp.logoUrl || (isAdmin ? defaultLogoUrl : '')
      });

      const bnk = dataOperations.getBankDetails();
      setBank({
        bankName: bnk.bankName || (isAdmin ? defaultBankName : ''),
        accountNumber: bnk.accountNumber || (isAdmin ? defaultAccountNumber : ''),
        accountName: bnk.accountName || (isAdmin ? defaultAccountName : '')
      });

      const trms = dataOperations.getTerms();
      setTerms(trms && trms.length > 0 ? trms : (isAdmin ? defaultTerms : []));
    } catch (error) {
      console.error('Error loading setup data:', error);
    }
  }, [user]);

  const customerNames = useMemo(() => {
    return Array.from(new Set(invoices.map((inv) => inv.customerName))).sort();
  }, [invoices]);

  const atInvoiceLimit = tier === 'hobort_shipper' && invoices.length >= FREE_TIER_MAX_INVOICES;
  const draftCount = 0;
  const atDraftLimit = tier === 'hobort_shipper' && draftCount >= FREE_TIER_MAX_DRAFTS;
  const canSaveDraft = currentDraftId || !atDraftLimit;

  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, l) => sum + l.total, 0);
  }, [lineItems]);

  const taxAmount = useMemo(() => {
    return (subtotal * (taxPercent || 0)) / 100;
  }, [subtotal, taxPercent]);

  const totalBeforeDiscount = useMemo(() => {
    return subtotal + taxAmount + (shippingFee || 0);
  }, [subtotal, taxAmount, shippingFee]);

  const grandTotal = useMemo(() => {
    return Math.max(0, totalBeforeDiscount - (discountAmount || 0));
  }, [totalBeforeDiscount, discountAmount]);

  useEffect(() => {
    const draftId = searchParams?.get('draft');
    if (draftId) {
      setShowOnboarding(false);
    } else {
      loadLastInvoiceData();
      // Always show onboarding modal when creating a new invoice
      setShowOnboarding(true);
    }
  }, [searchParams]);

  const loadLastInvoiceData = () => {
    if (typeof window === 'undefined' || !user) return;
    try {
      const uidOrId = (user as any).uid || (user as any).id || 'unknown';
      const key = `${LAST_INVOICE_DATA_KEY}_${uidOrId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return;

      const data: LastInvoiceData = JSON.parse(stored);
      setCurrency(data.currency || 'USD');
      setPaymentInstructions(data.paymentInstructions || '');
      setTaxPercent(data.taxPercent || 0);
      setDiscountAmount(data.discountAmount || 0);
      setShippingFee(data.shippingFee || 0);

      if (data.lineItems && data.lineItems.length > 0) {
        const templateItems = data.lineItems.map((item) => ({
          ...item,
          partNumber: '',
          qty: 0,
          total: 0,
        }));
        setLineItems(templateItems);
      }

      console.log('[CreateInvoice] Prefilled from last invoice');
    } catch (error) {
      console.error('[CreateInvoice] Failed to load last invoice data:', error);
    }
  };

  const saveLastInvoiceData = () => {
    if (typeof window === 'undefined' || !user) return;
    try {
      const data: LastInvoiceData = {
        currency,
        paymentInstructions,
        taxPercent,
        discountAmount,
        shippingFee,
        lineItems: lineItems.map((l) => ({ ...l })),
      };

      const uidOrId = (user as any).uid || (user as any).id || 'unknown';
      const key = `${LAST_INVOICE_DATA_KEY}_${uidOrId}`;
      localStorage.setItem(key, JSON.stringify(data));
      console.log('[CreateInvoice] Saved invoice data for prefill');
    } catch (error) {
      console.error('[CreateInvoice] Failed to save last invoice data:', error);
    }
  };

  const onOnboardingDismissed = () => {
    setShowOnboarding(false);
    // Reload setup data after onboarding is dismissed
    try {
      const existingLogo = dataOperations.getLogoUrl();
      setLogoUrl(existingLogo || (isAdmin ? defaultLogoUrl : null));

      const comp = dataOperations.getCompanyDetails();
      setCompany({
        companyName: comp.companyName || (isAdmin ? defaultCompanyName : ''),
        address: comp.address || (isAdmin ? defaultAddress : ''),
        phone: comp.phone || (isAdmin ? defaultPhone : ''),
        website: comp.website || (isAdmin ? defaultWebsite : ''),
        email: comp.email || (isAdmin ? defaultEmail : ''),
        logoUrl: comp.logoUrl || (isAdmin ? defaultLogoUrl : '')
      });

      const bnk = dataOperations.getBankDetails();
      setBank({
        bankName: bnk.bankName || (isAdmin ? defaultBankName : ''),
        accountNumber: bnk.accountNumber || (isAdmin ? defaultAccountNumber : ''),
        accountName: bnk.accountName || (isAdmin ? defaultAccountName : '')
      });

      const trms = dataOperations.getTerms();
      setTerms(trms && trms.length > 0 ? trms : (isAdmin ? defaultTerms : []));
    } catch (error) {
      console.error('Error reloading setup data:', error);
    }
    maybeShowSetupReminder();
  };

  const maybeShowSetupReminder = () => {
    if (typeof window === 'undefined') return;
    if (!logoUrl && sessionStorage.getItem(SETUP_REMINDER_SHOWN_KEY) !== '1') {
      sessionStorage.setItem(SETUP_REMINDER_SHOWN_KEY, '1');
      showToast(
        'info',
        'Complete your setup (logo, bank details, terms) before you can finish invoices and download PDFs.',
        6000
      );
    }
  };

  const applyPreset = (id: string) => {
    const today = new Date();
    if (id === 'standard') {
      setTaxPercent(10);
      setDueDate(dateToString(new Date(today.getTime() + 30 * 86400000)));
    } else if (id === 'ghs') {
      setCurrency('GHS');
      setDueDate(dateToString(new Date(today.getTime() + 30 * 86400000)));
    } else if (id === 'net15') {
      setDueDate(dateToString(new Date(today.getTime() + 15 * 86400000)));
    }
  };

  const addLine = () => {
    clearError('lineItems');
    clearError('partNumbers');
    setLineItems([...lineItems, newLine()]);
  };

  const removeLine = (index: number) => {
    clearError('lineItems');
    clearError('partNumbers');
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, patch: Partial<LineItem>) => {
    clearError('lineItems');
    clearError('partNumbers');
    setLineItems((list) => {
      const copy = [...list];
      const line = { ...copy[index], ...patch };
      copy[index] = recalcLineItem(line);
      return copy;
    });
  };

  const recalcLineItem = (line: LineItem): LineItem => {
    const rate = line.rate || 0;
    const qty = line.qty || 0;
    return { ...line, total: rate * qty };
  };

  const validate = (): Record<string, string> => {
    const err: Record<string, string> = {};
    const name = customerName.trim();
    if (!name) err['customerName'] = 'Enter the client or company name';
    const items = lineItems.filter((l) => l.description.trim() || l.rate > 0 || l.qty > 0);
    if (items.length === 0) err['lineItems'] = 'Add at least one line item with a description and amount';
    for (const l of items) {
      if (l.description.toLowerCase().includes('part purchase') && !l.partNumber.trim()) {
        err['partNumbers'] = 'Items with "Part Purchase" in the description need a Part #';
        break;
      }
    }
    return err;
  };

  const clearError = (key: string) => {
    setValidationErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const clearForm = () => {
    setCurrentDraftId(null);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerAddress('');
    setPurchaseOrder('');
    setInvoiceDate(dateToString(new Date()));
    setDueDate(dateToString(new Date(Date.now() + 14 * 86400000)));
    setCurrency('USD');
    setPaymentInstructions('');
    setTaxPercent(0);
    setDiscountAmount(0);
    setShippingFee(0);
    setLineItems([newLine()]);
    setValidationErrors({});
    router.push('/portal/billing/invoices/create');
    showToast('success', 'Form cleared');
  };

  const deleteInvoice = () => {
    showToast(
      'info',
      'Delete this invoice? This cannot be undone.',
      0,
      {
        label: 'Delete',
        callback: () => {
          const id = nextInvoiceId;
          try {
            const existingInvoice = invoices.find((inv) => inv.id === id);
            if (existingInvoice) {
              dataOperations.deleteInvoice(id);
              showToast('success', 'Invoice deleted');
              router.push('/portal/billing/dashboard');
            } else {
              showToast('info', 'No invoice to delete');
              router.push('/portal/billing/dashboard');
            }
          } catch {
            showToast('error', 'Failed to delete invoice');
          }
        },
      },
      {
        label: 'Cancel',
        callback: () => { },
      }
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[CreateInvoice] submit() called');

    if (atInvoiceLimit) {
      console.log('[CreateInvoice] At invoice limit');
      showToast(
        'info',
        `You've reached the free plan limit (${FREE_TIER_MAX_INVOICES} invoices). Upgrade to Pro for unlimited invoices.`,
        0
      );
      return;
    }
    if (!logoUrl) {
      console.log('[CreateInvoice] No logo found');
      showToast('error', 'Complete setup: add your logo in Settings before creating invoices.');
      return;
    }
    const err = validate();
    if (Object.keys(err).length > 0) {
      console.log('[CreateInvoice] Validation errors:', err);
      setValidationErrors(err);
      showToast('error', 'Please fix the errors below.');
      return;
    }
    const name = customerName.trim();
    const items = lineItems.filter((l) => l.description.trim() || l.rate > 0 || l.qty > 0);
    setValidationErrors({});
    setSubmitting(true);

    console.log('[CreateInvoice] Creating invoice...', { name, itemCount: items.length });

    saveLastInvoiceData();

    try {
      const inv = await dataOperations.addInvoice({
        customerName: name,
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        lineItems: items.map((l) => recalcLineItem(l)),
        status: 'balance_due',
        createdAt: invoiceDate,
        dueDate: dueDate || undefined,
        currency: currency || 'USD',
        purchaseOrder: purchaseOrder.trim() || undefined,
        paymentInstructions: paymentInstructions.trim() || undefined,
        taxPercent: taxPercent || undefined,
        discountAmount: discountAmount || undefined,
        shippingFee: shippingFee || undefined,
      });

      console.log('[CreateInvoice] Invoice created:', inv.id);

      setSubmitting(false);

      console.log('[CreateInvoice] Showing success toast...');
      showToast('success', `${inv.id} Created`);

      console.log('[CreateInvoice] Navigating to:', `/invoices/${inv.id}`);

      setTimeout(() => {
        router.push(`/portal/billing/invoices/${inv.id}`);
      }, 100);
    } catch (error) {
      console.error('[CreateInvoice] Error creating invoice:', error);
      setSubmitting(false);
      showToast('error', 'Failed to create invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className={styles.page}>
          <header className={styles.header}>
            <div className="h-8 w-48 bg-slate-200 rounded-md animate-pulse mb-2" />
            <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
          </header>

          <div className="w-full space-y-6">
            {/* Top Row: Customer Info & Invoice Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-slate-200 rounded-md animate-pulse" />
                <div className="h-10 w-full bg-slate-200 rounded-md animate-pulse" />
                <div className="h-24 w-full bg-slate-200 rounded-md animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-slate-200 rounded-md animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 w-full bg-slate-200 rounded-md animate-pulse" />
                  <div className="h-10 w-full bg-slate-200 rounded-md animate-pulse" />
                </div>
              </div>
            </div>

            {/* Line Items Table Skeleton */}
            <div className="mt-8 space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="flex gap-4">
                <div className="h-10 w-1/3 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-10 w-1/4 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-10 w-1/6 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-10 w-1/6 bg-slate-200 rounded-md animate-pulse" />
              </div>
            </div>

            {/* Action Bar Skeleton */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
              <div className="h-10 w-32 bg-slate-200 rounded-md animate-pulse" />
              <div className="flex gap-4">
                <div className="h-12 w-24 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-12 w-32 bg-slate-200 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {showOnboarding && <OnboardingModal onDismissed={onOnboardingDismissed} />}

      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Create invoice</h1>
          <p className={styles.headerSubtitle}>
            Fill in the details below. Totals update live as you type. You can save a draft and finish later.
          </p>
        </header>

        {atInvoiceLimit && (
          <div className={styles.limitBanner} role="alert">
            <p>You've reached the free plan limit ({FREE_TIER_MAX_INVOICES} invoices). Upgrade to Pro for unlimited invoices.</p>
            <Link href="/portal/billing/settings" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>
              Upgrade to Pro
            </Link>
          </div>
        )}

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formColumns}>
            <div className={styles.formMain}>
              {/* Invoice details */}
              <section className={styles.card}>
                <div className={styles.cardInner}>
                  <div className={styles.cardHead}>
                    <div>
                      <h2 className={styles.cardTitle}>Invoice details</h2>
                    </div>
                    <div className={styles.presets}>
                      <span className={styles.presetsLabel}>Quick preset</span>
                      <div className={styles.presetsWrap}>
                        <PresetDropdown onPresetSelect={applyPreset} />
                      </div>
                    </div>
                  </div>
                  <div className={`${styles.cardContent} ${styles.cardContentRow}`}>
                    <div className={`${styles.cardRow} ${styles.cardRowWrap}`}>
                      <div className={`${styles.field} ${styles.fieldShort}`}>
                        <label htmlFor="inv-number">Invoice number</label>
                        <input
                          id="inv-number"
                          type="text"
                          value={nextInvoiceId}
                          readOnly
                          className={`${styles.input} ${styles.inputReadonly}`}
                        />
                      </div>
                      <div className={`${styles.field} ${styles.fieldShort}`}>
                        <label htmlFor="po">Purchase order</label>
                        <input
                          id="po"
                          type="text"
                          value={purchaseOrder}
                          onChange={(e) => setPurchaseOrder(e.target.value)}
                          placeholder="Optional"
                          className={styles.input}
                          title="Customer's order reference (optional)"
                        />
                      </div>
                      <div className={`${styles.field} ${styles.fieldShort}`}>
                        <label htmlFor="currency">Currency</label>
                        <CurrencyDropdown options={CURRENCIES} value={currency} onChange={setCurrency} />
                      </div>
                      <div className={`${styles.field} ${styles.fieldShort}`}>
                        <label htmlFor="inv-date">Invoice date</label>
                        <input
                          id="inv-date"
                          type="date"
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                          className={styles.input}
                        />
                      </div>
                      <div className={`${styles.field} ${styles.fieldShort}`}>
                        <label htmlFor="due-date">Due date</label>
                        <input
                          id="due-date"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className={styles.input}
                        />
                      </div>
                    </div>
                  </div>
                  <p className={styles.cardHint}>
                    Logo and bank details come from <Link href="/portal/billing/settings" className={styles.link}>Settings</Link> and will appear on the PDF.
                  </p>
                </div>
              </section>

              {/* Bill to */}
              <section className={styles.card}>
                <div className={styles.cardInner}>
                  <h2 className={styles.cardTitle}>Bill to</h2>
                  <p className={styles.cardSubtitle}>Who is this invoice for?</p>
                  <div className={`${styles.cardContent} ${styles.cardContentFields}`}>
                    <div className={styles.cardFields}>
                      <div className={`${styles.field} ${validationErrors['customerName'] ? styles.fieldInvalid : ''}`}>
                        <label htmlFor="customer">
                          Client or company name <span className={styles.required}>*</span>
                        </label>
                        <input
                          id="customer"
                          type="text"
                          list="customer-list"
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                            clearError('customerName');
                          }}
                          placeholder="e.g. Acme Motors Ltd"
                          className={styles.input}
                          required
                          title="Start typing to see past customers"
                        />
                        {validationErrors['customerName'] && (
                          <p className={styles.fieldError}>{validationErrors['customerName']}</p>
                        )}
                        <datalist id="customer-list">
                          {customerNames.map((name) => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                          id="email"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="billing@company.com"
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="address">Address</label>
                        <textarea
                          id="address"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          rows={2}
                          placeholder="Street, city, country"
                          className={`${styles.input} ${styles.textarea}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Line items */}
              <section className={`${styles.card} ${validationErrors['lineItems'] || validationErrors['partNumbers'] ? styles.cardInvalid : ''}`}>
                <div className={styles.cardInner}>
                  {(validationErrors['lineItems'] || validationErrors['partNumbers']) && (
                    <p className={`${styles.fieldError} ${styles.fieldErrorCard}`}>
                      {validationErrors['lineItems'] || validationErrors['partNumbers']}
                    </p>
                  )}
                  <div className={styles.cardHead}>
                    <div>
                      <h2 className={styles.cardTitle}>Line items</h2>
                      <p className={styles.cardSubtitle}>Add each product or service. Amount = Unit cost × Quantity.</p>
                    </div>
                    <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={addLine}>
                      + Add item
                    </button>
                  </div>
                  <div className={styles.tableCard}>
                    <table className={styles.createTable}>
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Part #</th>
                          <th>Unit cost</th>
                          <th>Qty</th>
                          <th>Amount</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((line, i) => (
                          <tr key={i}>
                            <td>
                              <input
                                type="text"
                                value={line.description}
                                onChange={(e) => updateLine(i, { description: e.target.value })}
                                placeholder="e.g. Part Purchase"
                                className={`${styles.input} ${styles.inputCell}`}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={line.partNumber}
                                onChange={(e) => updateLine(i, { partNumber: e.target.value })}
                                placeholder="Part #AX-102"
                                className={`${styles.input} ${styles.inputCell}`}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                value={line.rate || ''}
                                onChange={(e) => updateLine(i, { rate: +e.target.value })}
                                className={`${styles.input} ${styles.inputCell} ${styles.inputNumber}`}
                                aria-label="Unit cost"
                                placeholder="0"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={line.qty || ''}
                                onChange={(e) => updateLine(i, { qty: +e.target.value })}
                                className={`${styles.input} ${styles.inputCell} ${styles.inputNumber}`}
                                aria-label="Quantity"
                                placeholder="0"
                              />
                            </td>
                            <td className={styles.createTableAmount}>{line.total.toFixed(2)}</td>
                            <td className={styles.createTableAction}>
                              {lineItems.length > 1 && (
                                <button
                                  type="button"
                                  className={`${styles.btn} ${styles.btnGhost}`}
                                  onClick={() => removeLine(i)}
                                  aria-label="Remove line"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Notes */}
              <section className={styles.card}>
                <div className={styles.cardInner}>
                  <h2 className={styles.cardTitle}>Notes & payment terms</h2>
                  <p className={styles.cardSubtitle}>Optional instructions (e.g. bank transfer details, due date note).</p>
                  <div className={`${styles.cardContent} ${styles.cardContentTextarea}`}>
                    <textarea
                      value={paymentInstructions}
                      onChange={(e) => setPaymentInstructions(e.target.value)}
                      rows={3}
                      placeholder="e.g. Wire instructions or payment reference"
                      className={`${styles.input} ${styles.textarea}`}
                    />
                  </div>
                </div>
              </section>
            </div>

            <aside className={styles.formSidebar}>
              {/* Summary */}
              <section className={`${styles.card} ${styles.cardTotals}`}>
                <div className={styles.cardInner}>
                  <h2 className={styles.cardTitle}>Summary</h2>
                  <div className={styles.totalsGrid}>
                    <div className={styles.totalsLine}>
                      <span>Subtotal</span>
                      <span>{subtotal.toFixed(2)} {currency}</span>
                    </div>
                    <div className={`${styles.totalsLine} ${styles.totalsLineInput}`}>
                      <label htmlFor="tax">Tax %</label>
                      <input
                        id="tax"
                        type="number"
                        min="0"
                        step="0.01"
                        value={taxPercent || ''}
                        onChange={(e) => setTaxPercent(+e.target.value)}
                        className={`${styles.input} ${styles.inputSm}`}
                      />
                      <span className={styles.totalsSuffix}>% = {taxAmount.toFixed(2)} {currency}</span>
                    </div>
                    <div className={`${styles.totalsLine} ${styles.totalsLineInput}`}>
                      <label htmlFor="discount">Discount</label>
                      <input
                        id="discount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={discountAmount || ''}
                        onChange={(e) => setDiscountAmount(+e.target.value)}
                        className={`${styles.input} ${styles.inputSm}`}
                      />
                      <span className={styles.totalsSuffix}>{discountAmount.toFixed(2)} {currency}</span>
                    </div>
                    <div className={`${styles.totalsLine} ${styles.totalsLineInput}`}>
                      <label htmlFor="shipping">Shipping</label>
                      <input
                        id="shipping"
                        type="number"
                        min="0"
                        step="0.01"
                        value={shippingFee || ''}
                        onChange={(e) => setShippingFee(+e.target.value)}
                        className={`${styles.input} ${styles.inputSm}`}
                      />
                      <span className={styles.totalsSuffix}>{shippingFee.toFixed(2)} {currency}</span>
                    </div>
                    <div className={`${styles.totalsLine} ${styles.totalsLineTotal}`}>
                      <span>Total</span>
                      <span>{grandTotal.toFixed(2)} {currency}</span>
                    </div>
                  </div>
                  <div className={styles.createActions}>
                    <button
                      type="submit"
                      className={`${styles.btn} ${styles.btnPrimary} ${styles.btnCta}`}
                      disabled={submitting || atInvoiceLimit}
                    >
                      {submitting ? 'Creating…' : 'Create invoice'}
                    </button>
                  </div>
                  <div className={`${styles.createActions} ${styles.createActionsSecondary}`}>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnGhost}`}
                      onClick={clearForm}
                    >
                      Clear form
                    </button>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnGhost} ${styles.btnDanger}`}
                      onClick={deleteInvoice}
                    >
                      Delete invoice
                    </button>
                  </div>
                </div>
              </section>

              {/* Your setup */}
              <section className={`${styles.card} ${styles.cardSetup}`}>
                <div className={styles.cardInner}>
                  <header className={styles.setupCardHeader}>
                    <h2 className={`${styles.cardTitle} ${styles.setupCardTitle}`}>Your setup</h2>
                    <Link href="/portal/billing/settings" className={styles.setupCardEdit}>
                      Edit
                    </Link>
                  </header>

                  {!logoUrl && !company.companyName && !bank.bankName && !bank.accountNumber && terms.length === 0 ? (
                    <>
                      <p className={styles.setupCardEmpty}>
                        Add your logo, company details, and bank info in Settings so they appear on every invoice.
                      </p>
                      <Link href="/portal/billing/settings" className={styles.setupCardCta}>
                        Go to Settings
                      </Link>
                    </>
                  ) : (
                    <div className={styles.setupCardBody}>
                      {logoUrl && (
                        <div className={styles.setupCardBlock}>
                          <span className={styles.setupCardLabel}>Logo</span>
                          <div className={styles.setupCardLogoBox}>
                            <img src={logoUrl} alt="Logo" className={styles.setupCardLogo} />
                          </div>
                        </div>
                      )}
                      {company.companyName && (
                        <div className={styles.setupCardBlock}>
                          <span className={styles.setupCardLabel}>Bill from</span>
                          <div className={styles.setupCardText}>
                            <p className={styles.setupCardName}>{company.companyName}</p>
                            {company.address && <p className={styles.setupCardMeta}>{company.address}</p>}
                            {company.phone && <p className={styles.setupCardMeta}>{company.phone}</p>}
                            {company.email && <p className={styles.setupCardMeta}>{company.email}</p>}
                            {company.website && <p className={styles.setupCardMeta}>{company.website}</p>}
                          </div>
                        </div>
                      )}
                      {(bank.bankName || bank.accountNumber) && (
                        <div className={styles.setupCardBlock}>
                          <span className={styles.setupCardLabel}>Bank</span>
                          <div className={styles.setupCardText}>
                            <p className={styles.setupCardName}>{bank.bankName}</p>
                            {bank.accountNumber && (
                              <p className={styles.setupCardMeta}>
                                {bank.accountNumber}
                                {bank.accountName && ` (${bank.accountName})`}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {terms.length > 0 && (
                        <div className={styles.setupCardBlock}>
                          <span className={styles.setupCardLabel}>Terms</span>
                          <p className={styles.setupCardMeta}>{terms.length} term(s) configured</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
