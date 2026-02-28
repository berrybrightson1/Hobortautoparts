'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/billing/AppLayout';
import { dataOperations } from '@/lib/billing/data/useData';
import { useToast } from '@/lib/billing/toast/useToast';
import { useAuth } from '@/components/auth/auth-provider';
import styles from './settings.module.css';


// Compress image to a target max size (default: 112 KB base64 string, ~110 KB decoded)
async function compressImage(
  file: File,
  maxBytes = 112_000,  // max base64 string length (~110 KB)
  maxDim = 800         // max width or height in px
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unavailable')); return; }

        // Scale down to maxDim keeping aspect ratio
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height / width) * maxDim); width = maxDim; }
          else { width = Math.round((width / height) * maxDim); height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Use original MIME type if possible, fallback to image/png to preserve transparency
        const mimeType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';

        // Iteratively reduce quality until output fits within maxBytes (quality only applies to jpeg/webp)
        let quality = 0.85;
        let dataUrl = canvas.toDataURL(mimeType, quality);

        while (dataUrl.length > maxBytes && quality > 0.1) {
          quality = Math.round((quality - 0.1) * 10) / 10; // step down by 0.1
          // If PNG, quality parameter doesn't matter, we have to scale down dimensions instead
          if (mimeType === 'image/png') break;
          dataUrl = canvas.toDataURL(mimeType, quality);
        }

        // Last resort: if still too large, scale canvas down further and try again
        // For PNGs, this loop is the only way to reduce file size
        let currentLoop = 0;
        while (dataUrl.length > maxBytes && currentLoop < 3) {
          canvas.width = Math.round(canvas.width * 0.7);
          canvas.height = Math.round(canvas.height * 0.7);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL(mimeType, 0.7);
          currentLoop++;
        }

        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function SettingsPage() {
  const toast = useToast();
  const { user, profile } = useAuth();

  // Company details
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');

  // Bank details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Invoice config
  const [invoicePrefix, setInvoicePrefix] = useState('HBT');
  const [invoiceSuffix, setInvoiceSuffix] = useState('');
  const [invoicePadLength, setInvoicePadLength] = useState(4);

  // Terms
  const [termsText, setTermsText] = useState('');

  // Editing states
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [editingInvoiceConfig, setEditingInvoiceConfig] = useState(false);
  const [editingTerms, setEditingTerms] = useState(false);

  const [saving, setSaving] = useState<string | null>(null);
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const isAdmin = profile?.role === 'admin';
    const uid = user.id;

    // Default Hobort Details
    const defaultCompanyName = 'HOBORT AUTO PARTS EXPRESS';
    const defaultAddress = '815 Progress Ct Ste B Lawrenceville, GA 30043';
    const defaultPhone = '+1 678 496 6882';
    const defaultWebsite = 'https://www.hobortautopartsexpress.com';
    const defaultEmail = 'info@hobortautopartsexpress.com';
    const defaultLogoUrl = '/Hobort auto express logo Main.png';
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

    // Load all data
    const existingLogo = dataOperations.getLogoUrl(uid);
    setLogoUrl(existingLogo || (isAdmin ? defaultLogoUrl : null));

    const company = dataOperations.getCompanyDetails(uid);
    // Auto-fill from HAPE profile if no saved value
    setCompanyName(company.companyName || (isAdmin ? defaultCompanyName : profile?.full_name || ''));
    setCompanyAddress(company.address || (isAdmin ? defaultAddress : ''));
    setCompanyPhone(company.phone || (isAdmin ? defaultPhone : profile?.phone_number || ''));
    setCompanyWebsite(company.website || (isAdmin ? defaultWebsite : ''));
    setCompanyEmail(company.email || (isAdmin ? defaultEmail : user?.email || ''));
    setCompanyLogoUrl(company.logoUrl || (isAdmin ? defaultLogoUrl : ''));

    const bank = dataOperations.getBankDetails(uid);
    setBankName(bank.bankName || (isAdmin ? defaultBankName : ''));
    setAccountNumber(bank.accountNumber || (isAdmin ? defaultAccountNumber : ''));
    setAccountName(bank.accountName || (isAdmin ? defaultAccountName : ''));

    const terms = dataOperations.getTerms(uid);
    setTermsText(terms.length > 0 ? terms.join('\n') : (isAdmin ? defaultTerms.join('\n') : ''));

    const invConfig = dataOperations.getInvoiceNumberConfig(uid);
    setInvoicePrefix(invConfig.prefix || 'HBT');
    setInvoiceSuffix(invConfig.suffix);
    setInvoicePadLength(invConfig.padLength);
  }, [user?.id, profile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reject files above 1 MB before processing
    const ONE_MB = 1_048_576;
    if (file.size > ONE_MB) {
      toast.error('Logo too large', { description: 'Maximum file size is 1 MB. Please choose a smaller image.' } as any);
      e.target.value = '';
      return;
    }

    try {
      // Compress to ~110 KB max output
      const dataUrl = await compressImage(file);
      dataOperations.setLogoUrl(dataUrl, user?.id);
      setLogoUrl(dataUrl);
      const kb = Math.round(dataUrl.length / 1024);
      toast.success(`Logo updated (${kb} KB)`);
    } catch {
      toast.error('Failed to process logo');
    }

    e.target.value = '';
  };

  const clearLogo = () => {
    dataOperations.setLogoUrl(null);
    setLogoUrl(null);
    toast.success('Logo removed');
  };

  const saveCompany = () => {
    const website = companyWebsite.trim();
    const email = companyEmail.trim();
    const logo = companyLogoUrl.trim();
    const err: Record<string, string> = {};

    if (website && !/^https?:\/\/[^\s]+$/i.test(website)) {
      err['website'] = 'Enter a valid URL (e.g. https://example.com)';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err['email'] = 'Enter a valid email address';
    }
    if (logo && !/^https?:\/\/[^\s]+$/i.test(logo) && !logo.startsWith('data:')) {
      err['logoUrl'] = 'Enter a valid URL or use Upload logo';
    }

    if (Object.keys(err).length > 0) {
      setCompanyErrors(err);
      toast.error('Fix the errors before saving');
      return;
    }

    setCompanyErrors({});
    setSaving('company');
    dataOperations.setCompanyDetails({
      companyName: companyName.trim() || undefined,
      address: companyAddress.trim() || undefined,
      phone: companyPhone.trim() || undefined,
      website: website || undefined,
      email: email || undefined,
      logoUrl: logo || undefined,
    });
    toast.success('Bill from details saved');
    setSaving(null);
    setEditingCompany(false);
  };

  const saveBank = () => {
    setSaving('bank');
    dataOperations.setBankDetails({
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim() || undefined,
    });
    toast.success('Bank details saved');
    setSaving(null);
    setEditingBank(false);
  };

  const saveInvoiceConfig = () => {
    setSaving('invoiceConfig');
    const pad = Math.max(1, Math.min(8, invoicePadLength));
    dataOperations.setInvoiceNumberConfig({
      prefix: invoicePrefix.trim() || 'INV',
      suffix: invoiceSuffix.trim(),
      padLength: pad,
    });
    setInvoicePadLength(pad);
    toast.success('Invoice numbering updated');
    setSaving(null);
    setEditingInvoiceConfig(false);
  };

  const saveTerms = () => {
    setSaving('terms');
    const lines = termsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    dataOperations.setTerms(lines);
    toast.success('Terms saved');
    setSaving(null);
    setEditingTerms(false);
  };

  const cancelCompany = () => {
    const company = dataOperations.getCompanyDetails();
    setCompanyName(company.companyName);
    setCompanyAddress(company.address);
    setCompanyPhone(company.phone);
    setCompanyWebsite(company.website);
    setCompanyEmail(company.email);
    setCompanyLogoUrl(company.logoUrl || '');
    setCompanyErrors({});
    setEditingCompany(false);
  };

  const cancelBank = () => {
    const bank = dataOperations.getBankDetails();
    setBankName(bank.bankName);
    setAccountNumber(bank.accountNumber);
    setAccountName(bank.accountName || '');
    setEditingBank(false);
  };

  const cancelInvoiceConfig = () => {
    const invConfig = dataOperations.getInvoiceNumberConfig();
    setInvoicePrefix(invConfig.prefix);
    setInvoiceSuffix(invConfig.suffix);
    setInvoicePadLength(invConfig.padLength);
    setEditingInvoiceConfig(false);
  };

  const cancelTerms = () => {
    const terms = dataOperations.getTerms(user?.id);
    setTermsText(terms.join('\n'));
    setEditingTerms(false);
  };


  return (
    <AppLayout>
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Settings</h1>

        <div className={styles.settingsGrid}>
          {/* Account */}
          <section className={`${styles.settingsCard} ${styles.accountRow}`}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Account
            </h2>
            <div className={styles.accountBody}>
              <div className={styles.accountLeft}>
                <div className={styles.keyValue}>
                  <span className={styles.keyValueKey}>email</span>
                  <span className={styles.keyValueValue}>{user?.email || '-'}</span>
                </div>
                <div className={styles.keyValue}>
                  <span className={styles.keyValueKey}>plan</span>
                  <span className={styles.keyValueValue}>
                    <span className={styles.planBadge}>HAPE Member</span>
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* Branding */}
          <section className={`${styles.settingsCard} ${styles.wide}`}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              Branding
            </h2>
            <div className={styles.cardBody}>
              <div className={styles.brandingStack}>
                <div className={styles.logoBlock}>
                  {logoUrl && (
                    <div className={styles.logoPreview}>
                      <img src={logoUrl} alt="Logo" />
                      <button type="button" className={styles.btnGhost} onClick={clearLogo}>
                        Remove
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className={styles.fileInput}
                    aria-label="Upload logo"
                  />
                  <button
                    type="button"
                    className={styles.logoUploadBtn}
                    onClick={() => document.querySelector<HTMLInputElement>(`.${styles.fileInput}`)?.click()}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Upload logo</span>
                  </button>
                </div>
                <div className={styles.formBlock}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <input
                        id="companyName"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        readOnly={!editingCompany}
                        placeholder="Company name"
                        className={styles.fieldInput}
                      />
                    </div>
                    <div className={styles.field}>
                      <input
                        id="companyPhone"
                        type="text"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        readOnly={!editingCompany}
                        placeholder="Phone"
                        className={styles.fieldInput}
                      />
                    </div>
                    <div className={`${styles.field} ${companyErrors['email'] ? styles.fieldInvalid : ''}`}>
                      <input
                        id="companyEmail"
                        type="email"
                        value={companyEmail}
                        onChange={(e) => { setCompanyEmail(e.target.value); setCompanyErrors((e) => ({ ...e, email: '' })); }}
                        readOnly={!editingCompany}
                        placeholder="Email"
                        className={styles.fieldInput}
                      />
                      {companyErrors['email'] && (
                        <p className={styles.fieldError}>{companyErrors['email']}</p>
                      )}
                    </div>
                    <div className={`${styles.field} ${companyErrors['website'] ? styles.fieldInvalid : ''}`}>
                      <input
                        id="companyWebsite"
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => { setCompanyWebsite(e.target.value); setCompanyErrors((e) => ({ ...e, website: '' })); }}
                        readOnly={!editingCompany}
                        placeholder="Website"
                        className={styles.fieldInput}
                      />
                      {companyErrors['website'] && (
                        <p className={styles.fieldError}>{companyErrors['website']}</p>
                      )}
                    </div>
                    <div className={styles.field}>
                      <textarea
                        id="companyAddress"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        readOnly={!editingCompany}
                        rows={2}
                        placeholder="Address"
                        className={styles.fieldInput}
                      />
                    </div>
                  </div>
                  {editingCompany ? (
                    <div className={styles.formActions}>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={saveCompany}
                        disabled={saving !== null}
                      >
                        {saving === 'company' ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        className={styles.btnOutline}
                        onClick={cancelCompany}
                        disabled={saving !== null}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button type="button" className={styles.btnOutline} onClick={() => setEditingCompany(true)}>
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Bank Details */}
          <section className={styles.settingsCard}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Bank
            </h2>
            <div className={styles.cardBody}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <input
                    id="bankName"
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    readOnly={!editingBank}
                    placeholder="Bank name"
                    className={styles.fieldInput}
                  />
                </div>
                <div className={styles.field}>
                  <input
                    id="accountNumber"
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    readOnly={!editingBank}
                    placeholder="Account number"
                    className={styles.fieldInput}
                  />
                </div>
                <div className={styles.field}>
                  <input
                    id="accountName"
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    readOnly={!editingBank}
                    placeholder="Account name (optional)"
                    className={styles.fieldInput}
                  />
                </div>
              </div>
              {editingBank ? (
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={saveBank}
                    disabled={saving !== null}
                  >
                    {saving === 'bank' ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className={styles.btnOutline}
                    onClick={cancelBank}
                    disabled={saving !== null}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="button" className={styles.btnOutline} onClick={() => setEditingBank(true)}>
                  Edit
                </button>
              )}
            </div>
          </section>

          {/* Invoice Numbering */}
          <section className={styles.settingsCard}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
              Invoice numbering
            </h2>
            <div className={styles.cardBody}>
              <p className={styles.textMuted}>Next: {dataOperations.getNextInvoiceIdPreview([])}</p>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label htmlFor="invoicePrefix" className={styles.fieldLabel}>prefix</label>
                  <input
                    id="invoicePrefix"
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    readOnly={!editingInvoiceConfig}
                    placeholder="INV"
                    maxLength={8}
                    className={styles.fieldInput}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="invoiceSuffix" className={styles.fieldLabel}>suffix</label>
                  <input
                    id="invoiceSuffix"
                    type="text"
                    value={invoiceSuffix}
                    onChange={(e) => setInvoiceSuffix(e.target.value)}
                    readOnly={!editingInvoiceConfig}
                    placeholder="-2024"
                    maxLength={8}
                    className={styles.fieldInput}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="invoicePadLength" className={styles.fieldLabel}>pad_length</label>
                  <input
                    id="invoicePadLength"
                    type="number"
                    min="1"
                    max="8"
                    value={invoicePadLength}
                    onChange={(e) => setInvoicePadLength(+e.target.value)}
                    readOnly={!editingInvoiceConfig}
                    className={`${styles.fieldInput} ${styles.fieldNarrow}`}
                  />
                </div>
              </div>
              {editingInvoiceConfig ? (
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={saveInvoiceConfig}
                    disabled={saving !== null}
                  >
                    {saving === 'invoiceConfig' ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className={styles.btnOutline}
                    onClick={cancelInvoiceConfig}
                    disabled={saving !== null}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="button" className={styles.btnOutline} onClick={() => setEditingInvoiceConfig(true)}>
                  Edit
                </button>
              )}
            </div>
          </section>

          {/* Terms */}
          <section className={`${styles.settingsCard} ${styles.wide}`}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
              Logistics: Terms and conditions
            </h2>
            <div className={styles.cardBody}>
              <p className={styles.keyValueKey}>One line per term; shown on every receipt.</p>
              <textarea
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                readOnly={!editingTerms}
                rows={6}
                className={styles.termsInput}
                placeholder="e.g. Payment terms, shipping policy..."
              />
              <div className={styles.termsActions}>
                {editingTerms ? (
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={saveTerms}
                      disabled={saving !== null}
                    >
                      {saving === 'terms' ? 'Saving…' : 'Save terms'}
                    </button>
                    <button
                      type="button"
                      className={styles.btnOutline}
                      onClick={cancelTerms}
                      disabled={saving !== null}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.btnOutline} onClick={() => setEditingTerms(true)}>
                    Edit
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}