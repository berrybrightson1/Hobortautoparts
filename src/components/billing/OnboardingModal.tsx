'use client';

import { useState, useRef, useEffect } from 'react';
import { dataOperations } from '@/lib/billing/data/useData';
import { useToast } from '@/lib/billing/toast/useToast';
import { compressImage } from '@/lib/billing/helpers/imageCompress';
import { useAuth } from '@/components/auth/auth-provider';
import styles from './OnboardingModal.module.css';

interface OnboardingModalProps {
  onDismissed: () => void;
}

export default function OnboardingModal({ onDismissed }: OnboardingModalProps) {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const defaultLogoUrl = '/Hobort auto express logo Main.png';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(isAdmin ? defaultLogoUrl : null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Default Hobort Details
  const defaultCompanyName = 'HOBORT AUTO PARTS EXPRESS';
  const defaultAddress = '815 Progress Ct Ste B Lawrenceville, GA 30043';
  const defaultPhone = '+1 678 496 6882';
  const defaultWebsite = 'https://www.hobortautopartsexpress.com';
  const defaultEmail = 'info@hobortautopartsexpress.com';

  const defaultBankName = 'GT BANK Labone Branch';
  const defaultAccountNumber = 'Cedi account -3226001001656';
  const defaultAccountName = 'Hobort Shipping';

  const defaultTerms = `1. Hobort Auto Parts Express operates as a sourcing and logistics service provider.
2. Shipping to Ghana is not included in this invoice and will be confirmed upon receipt of parts at our warehouse.
3. Full payment is required before parts are purchased from suppliers.
4. Any warranty provided is strictly that of the original supplier or manufacturer.
5. Customer is responsible for confirming compatibility (VIN, part number, trim, specifications).
6. Delivery timelines are estimates and may be affected by supplier or customs delays.`;

  const [companyName, setCompanyName] = useState(isAdmin ? defaultCompanyName : '');
  const [companyAddress, setCompanyAddress] = useState(isAdmin ? defaultAddress : '');
  const [companyPhone, setCompanyPhone] = useState(isAdmin ? defaultPhone : '');
  const [companyWebsite, setCompanyWebsite] = useState(isAdmin ? defaultWebsite : '');
  const [companyEmail, setCompanyEmail] = useState(isAdmin ? defaultEmail : '');
  const [bankName, setBankName] = useState(isAdmin ? defaultBankName : '');
  const [accountNumber, setAccountNumber] = useState(isAdmin ? defaultAccountNumber : '');
  const [accountName, setAccountName] = useState(isAdmin ? defaultAccountName : '');
  const [termsText, setTermsText] = useState(isAdmin ? defaultTerms : '');
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing saved data on component mount
  useEffect(() => {
    try {
      let hasData = false;

      // Load logo
      const savedLogo = dataOperations.getLogoUrl();
      if (savedLogo) {
        setLogoPreview(savedLogo);
        hasData = true;
      }

      // Load company details
      const company = dataOperations.getCompanyDetails();
      if (company.companyName) {
        setCompanyName(company.companyName);
        hasData = true;
      }
      if (company.address) setCompanyAddress(company.address);
      if (company.phone) setCompanyPhone(company.phone);
      if (company.website) setCompanyWebsite(company.website);
      if (company.email) setCompanyEmail(company.email);

      // Load bank details
      const bank = dataOperations.getBankDetails();
      if (bank.bankName) {
        setBankName(bank.bankName);
        hasData = true;
      }
      if (bank.accountNumber) setAccountNumber(bank.accountNumber);
      if (bank.accountName) setAccountName(bank.accountName);

      // Load terms
      const terms = dataOperations.getTerms();
      if (terms.length > 0) {
        setTermsText(terms.join('\n'));
        hasData = true;
      }

      // Show info toast if we loaded saved data
      if (hasData) {
        showToast('info', 'Your saved settings have been loaded. Review and confirm to continue.', 3000);
      }
    } catch (error) {
      console.error('Error loading saved settings:', error);
      showToast('error', 'Failed to load saved settings.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFile(file);
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleFile = (file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    dataOperations.setLogoUrl(null);
  };

  const saveBankAndTerms = () => {
    dataOperations.setCompanyDetails({
      companyName: companyName.trim() || undefined,
      address: companyAddress.trim() || undefined,
      phone: companyPhone.trim() || undefined,
      website: companyWebsite.trim() || undefined,
      email: companyEmail.trim() || undefined,
    });
    dataOperations.setBankDetails({
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim() || undefined,
    });
    const lines = termsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    dataOperations.setTerms(lines);
  };

  const handleContinue = async () => {
    if (!logoPreview) {
      showToast('error', 'Logo is required');
      return;
    }
    if (logoFile) {
      try {
        const dataUrl = await compressImage(logoFile);
        dataOperations.setLogoUrl(dataUrl);
        saveBankAndTerms();
        showToast('success', 'Setup complete');
        onDismissed();
      } catch {
        showToast('error', 'Failed to process logo');
      }
    } else {
      dataOperations.setLogoUrl(logoPreview);
      saveBankAndTerms();
      showToast('success', 'Setup complete');
      onDismissed();
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!logoPreview) {
        showToast('error', 'Logo is required');
        return;
      }
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step === 3 ? 2 : 1);
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.btnClose} onClick={onDismissed} aria-label="Close">
          ×
        </button>

        {step === 1 && (
          <>
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <div className={styles.headerIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div className={styles.steps} aria-label="Progress">
                  <span className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>1</span>
                  <span className={styles.stepSep}></span>
                  <span className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>2</span>
                  <span className={styles.stepSep}></span>
                  <span className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>3</span>
                </div>
              </div>
              <h2 id="onboarding-title" className={styles.title}>Welcome to Hobort Billing</h2>
              <p className={styles.subtitle}>
                {logoPreview && !isLoadingData
                  ? "Your saved logo is ready. Review it or upload a new one to continue."
                  : "Let's get your branding ready. Start by uploading your logo; it appears at the top of every invoice and receipt."
                }
              </p>
            </header>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Logo <span className={styles.required}>*</span></h3>
              <div
                className={`${styles.dropzone} ${logoPreview ? styles.dropzoneHasFile : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <div className={styles.dropzonePreview}>
                    <img src={logoPreview} alt="Logo" />
                    <div className={styles.dropzoneActions}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnGhost} ${styles.btnAction}`}
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      >
                        Change logo
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnGhost} ${styles.btnRemove}`}
                        onClick={(e) => { e.stopPropagation(); clearLogo(); }}
                        aria-label="Remove logo"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.dropzonePlaceholder}>
                    <div className={styles.dropzoneIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                    <p className={styles.dropzoneText}>Choose a file or drag & drop it here</p>
                    <p className={styles.dropzoneSpecs}>JPEG, PNG, or SVG, up to 5 MB. Logos are compressed automatically.</p>
                    <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.dropzoneBtn}`}>
                      Choose logo
                    </button>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/svg+xml"
                ref={fileInputRef}
                className={styles.fileInput}
                onChange={handleFileChange}
                aria-label="Upload logo"
              />
            </section>
          </>
        )}

        {step === 2 && (
          <>
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <div className={styles.headerIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div className={styles.steps} aria-label="Progress">
                  <span className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>1</span>
                  <span className={styles.stepSep}></span>
                  <span className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>2</span>
                  <span className={styles.stepSep}></span>
                  <span className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>3</span>
                </div>
              </div>
              <h2 id="onboarding-title" className={styles.title}>Bill from details</h2>
              <p className={styles.subtitle}>
                {(companyName || companyAddress || companyPhone || companyWebsite || companyEmail) && !isLoadingData
                  ? "Review your saved company information or make changes as needed."
                  : "Add your company info so customers know who sent the invoice. You can edit this anytime in Settings."
                }
              </p>
            </header>

            <section className={styles.section}>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label htmlFor="onb-company">Company name</label>
                  <input
                    id="onb-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Your company name"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="onb-address">Address</label>
                  <textarea
                    id="onb-address"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    rows={2}
                    placeholder="Street, city, country"
                    className={`${styles.input} ${styles.textarea}`}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="onb-phone">Phone</label>
                  <input
                    id="onb-phone"
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="e.g. +233 24 123 4567"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="onb-website">Website</label>
                  <input
                    id="onb-website"
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="onb-email">Email</label>
                  <input
                    id="onb-email"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="billing@example.com"
                    className={styles.input}
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {step === 3 && (
          <>
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <div className={styles.headerIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div className={styles.steps} aria-label="Progress">
                  <span className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>1</span>
                  <span className={styles.stepSep}></span>
                  <span className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>2</span>
                  <span className={styles.stepSep}></span>
                  <span className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>3</span>
                </div>
              </div>
              <h2 id="onboarding-title" className={styles.title}>Payment & terms</h2>
              <p className={styles.subtitle}>
                {(bankName || accountNumber || termsText) && !isLoadingData
                  ? "Review your saved bank details and terms, or update them as needed."
                  : "Add where customers should pay (bank details) and any terms you want on every invoice. Editable later in Settings."
                }
              </p>
            </header>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Bank details</h3>
              <p className={styles.sectionHint}>
                Customers see this when paying (e.g. bank name, account number).
              </p>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label htmlFor="onb-bank">Bank name</label>
                  <input
                    id="onb-bank"
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Bank name"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="onb-account">Account number</label>
                  <input
                    id="onb-account"
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="onb-accname">Account name</label>
                  <input
                    id="onb-accname"
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Your company name"
                    className={styles.input}
                  />
                </div>
              </div>

              <h3 className={`${styles.sectionTitle} ${styles.sectionTitleSpaced}`}>Terms & conditions</h3>
              <p className={styles.sectionHint}>
                One line per term (e.g. payment due within 30 days, shipping conditions).
              </p>
              <textarea
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                rows={3}
                placeholder="e.g. Payment due within 30 days. Shipping policy."
                className={`${styles.input} ${styles.textarea}`}
              />
            </section>
          </>
        )}

        <footer className={styles.actions}>
          {step === 1 && (
            <>
              <button type="button" className={`${styles.btn} ${styles.btnOutline} ${styles.btnSkip}`} onClick={onDismissed}>
                Skip for now
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleNext}>
                Next
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={handleBack}>
                Back
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnOutline} ${styles.btnSkip}`} onClick={onDismissed}>
                Skip for now
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleNext}>
                Next
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={handleBack}>
                Back
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnOutline} ${styles.btnSkip}`} onClick={onDismissed}>
                Skip for now
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleContinue}>
                Finish & create first invoice
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
