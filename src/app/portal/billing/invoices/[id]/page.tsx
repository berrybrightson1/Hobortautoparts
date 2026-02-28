'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInvoices, dataOperations } from '@/lib/billing/data/useData';
import { useToast } from '@/lib/billing/toast/useToast';
import { useAuth as useAppAuth } from '@/components/auth/auth-provider';
import { useAuth } from '@/lib/billing/firebase/useAuth';
import { generateInvoicePdf, downloadPdf as triggerPdfDownload } from '@/lib/billing/pdf/pdfGenerator';
import AppLayout from '@/components/billing/AppLayout';
import styles from './detail.module.css';

const FREE_TIER_MAX_INVOICES = 3;

interface InvoiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { invoices } = useInvoices();
  const { showToast } = useToast();
  const { tier } = useAuth();
  const { profile } = useAppAuth();

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

  const [action, setAction] = useState<'duplicate' | 'paid' | 'unpaid' | 'delete' | 'pdf' | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [company, setCompany] = useState<any>({});
  const [bank, setBank] = useState<any>({});
  const [terms, setTerms] = useState<string[]>([]);

  // Load setup data
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
  }, [isAdmin]);

  const invoice = useMemo(() => {
    return invoices.find((inv) => inv.id === id);
  }, [invoices, id]);

  const subtotal = useMemo(() => {
    if (!invoice?.lineItems?.length) return 0;
    return invoice.lineItems.reduce((s: number, l) => s + l.total, 0);
  }, [invoice]);

  const taxAmount = useMemo(() => {
    const pct = invoice?.taxPercent ?? 0;
    return (subtotal * pct) / 100;
  }, [subtotal, invoice]);

  const grandTotal = useMemo(() => {
    const discount = invoice?.discountAmount ?? 0;
    const shipping = invoice?.shippingFee ?? 0;
    return Math.max(0, subtotal + taxAmount - discount + shipping);
  }, [subtotal, taxAmount, invoice]);

  useEffect(() => {
    if (invoice) {
      showToast('info', 'Invoice viewed', 2000);
    }
  }, [invoice?.id]);

  const setPaid = () => {
    setAction('paid');
    dataOperations.setInvoiceStatus(id, 'paid');
    showToast('success', `Payment for ${id} Confirmed`);
    setAction(null);
  };

  const setUnpaid = () => {
    setAction('unpaid');
    dataOperations.setInvoiceStatus(id, 'balance_due');
    showToast('success', 'Marked as balance due');
    setAction(null);
  };

  const duplicate = () => {
    if (tier === 'hobort_shipper' && invoices.length >= FREE_TIER_MAX_INVOICES) {
      showToast(
        'info',
        `You've reached the free plan limit (${FREE_TIER_MAX_INVOICES} invoices). Upgrade to Pro for unlimited invoices.`,
        0
      );
      return;
    }
    setAction('duplicate');
    try {
      const existingInvoice = invoices.find(inv => inv.id === id);
      if (!existingInvoice) return;
      const newId = `INV-${Date.now()}`;
      showToast('success', `Duplicated as ${newId}`);
      router.push(`/portal/billing/invoices`);
    } catch {
      showToast('error', 'Could not duplicate');
    } finally {
      setAction(null);
    }
  };

  const deleteInvoice = () => {
    showToast(
      'info',
      'Delete this invoice? This cannot be undone.',
      0,
      {
        label: 'Delete',
        callback: () => {
          setAction('delete');
          dataOperations.deleteInvoice(id);
          showToast('success', 'Invoice deleted');
          setTimeout(() => {
            router.push('/portal/billing/invoices');
          }, 300);
          setAction(null);
        },
      },
      {
        label: 'Cancel',
        callback: () => { },
      }
    );
  };

  const print = () => {
    window.print();
  };

  const loadImageAsDataUrl = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  };

  const downloadPdf = async () => {
    if (!invoice) return;

    setAction('pdf');

    try {
      let logoDataUrl: string | undefined;
      if (logoUrl) {
        try {
          logoDataUrl = await loadImageAsDataUrl(logoUrl);
        } catch (error) {
          console.warn('Failed to load logo for PDF:', error);
        }
      }

      const blob = await generateInvoicePdf(invoice, company, bank, terms, logoDataUrl);
      if (blob) {
        triggerPdfDownload(blob, `${invoice.id}.pdf`);
        showToast('success', `${invoice.id}.pdf downloaded`);
      } else {
        throw new Error('Blob generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('error', 'Failed to generate PDF');
    } finally {
      setAction(null);
    }
  };

  if (!invoice) {
    return (
      <AppLayout>
        <div className={styles.page}>
          <p className={styles.notFound}>Invoice not found.</p>
          <Link href="/portal/billing/dashboard" className={styles.link}>
            Back to Dashboard
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={styles.page}>
        <div className={`${styles.actions} ${styles.noPrint}`}>
          <Link href="/portal/billing/invoices" className={`${styles.btn} ${styles.btnOutline}`}>
            All invoices
          </Link>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnOutline}`}
            onClick={duplicate}
            disabled={action !== null}
          >
            {action === 'duplicate' ? 'Duplicating…' : 'Duplicate'}
          </button>
          {invoice.status === 'paid' ? (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={setUnpaid}
              disabled={action !== null}
            >
              {action === 'unpaid' ? 'Updating…' : 'Mark unpaid'}
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={setPaid}
              disabled={action !== null}
            >
              {action === 'paid' ? 'Updating…' : 'Mark paid'}
            </button>
          )}
          <button
            type="button"
            className={`${styles.btn} ${styles.btnOutline} ${styles.btnDanger}`}
            onClick={deleteInvoice}
            disabled={action !== null}
          >
            {action === 'delete' ? 'Deleting…' : 'Delete'}
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={print}>
            Print
          </button>
          {tier === 'pro' ? (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={downloadPdf}
              disabled={action !== null}
            >
              {action === 'pdf' ? 'Downloading…' : 'Download PDF'}
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnOutline}`}
              disabled
              title="Upgrade to Pro to download PDFs"
            >
              Download PDF (Pro)
            </button>
          )}
        </div>

        <article className={`bg-white shadow-2xl overflow-hidden max-w-[800px] mx-auto ${styles.printOnly}`} aria-label={`Receipt ${invoice.id}`}>
          {/* Top Angled Banner */}
          <div className="relative h-16 w-full overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#ee6c2b]" />
            <div className="absolute top-2 right-0 w-64 h-full bg-[#ee6c2b] transform origin-bottom-left -skew-x-[45deg]" />
            <div className="absolute top-2 right-20 w-12 h-full bg-[#f9bd99] transform origin-bottom-left -skew-x-[45deg]" />
            <div className="absolute top-2 right-36 w-8 h-full bg-[#f9bd99] transform origin-bottom-left -skew-x-[45deg]" />
          </div>

          <div className="px-10 py-6">
            <header className="mb-0">
              <div className="flex justify-between items-start mb-6">
                <div className="w-1/2">
                  {logoUrl && <img src={logoUrl} alt="Logo" className="max-h-20 -mt-20 mb-2 relative z-10" />}
                </div>
                <div className="w-1/2 flex flex-col items-end text-right relative z-10">
                  <h1 className="text-lg font-bold text-[#2c394b] mb-1">{company.companyName}</h1>
                  <div className="text-xs font-bold text-[#64748b]">
                    {company.phone && <p>Business Number {company.phone}</p>}
                  </div>
                  <div className="text-xs text-[#64748b] mt-1 space-y-1">
                    {company.address && <p>{company.address}</p>}
                    {company.website && <p className="text-blue-500">{company.website}</p>}
                    {company.email && <p>{company.email}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start mb-8">
                <div className="w-1/2 pr-4">
                  <section>
                    <h2 className="text-[10px] font-bold text-[#2c394b] uppercase mb-1">Bill To</h2>
                    <p className="text-base font-bold text-[#2c394b] mb-1">{invoice.customerName}</p>
                    <div className="text-xs text-[#64748b] space-y-1">
                      {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
                      {invoice.customerAddress && <p className="whitespace-pre-line">{invoice.customerAddress}</p>}
                    </div>
                  </section>
                </div>
                <div className="w-1/2 flex flex-col items-end text-right">
                  <div className="text-xs text-[#64748b] text-right space-y-1.5 align-top">
                    <p><span className="font-bold text-[#2c394b]">Invoice Number:</span> {invoice.id}</p>
                    <p><span className="font-bold text-[#2c394b]">Date:</span> {invoice.createdAt.replace(/-/g, '.')}</p>
                    {invoice.dueDate && (
                      <p><span className="font-bold text-[#2c394b]">Due:</span> {invoice.dueDate === invoice.createdAt ? 'On Receipt' : invoice.dueDate.replace(/-/g, '.')}</p>
                    )}
                    {invoice.status !== 'paid' ? (
                      <p><span className="font-bold text-[#ee6c2b]">Balance Due:</span> <span className="font-bold text-[#2c394b]">{invoice.currency || 'USD'} ${grandTotal.toFixed(2)}</span></p>
                    ) : (
                      <p><span className="font-bold text-green-500">Status: PAID</span></p>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <table className="w-full mb-8">
              <thead>
                <tr className="bg-[#ee6c2b] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2 px-3 text-left">Description</th>
                  <th className="py-2 px-3 text-right w-28">Rate</th>
                  <th className="py-2 px-3 text-center w-16">Qty</th>
                  <th className="py-2 px-3 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="text-xs text-[#2c394b]">
                {invoice.lineItems.map((line, i) => (
                  <tr key={i} className="border-b border-[#f1f5f9]">
                    <td className="py-4 px-3 align-top">
                      <div className="font-medium text-[#2c394b] mb-1 whitespace-nowrap overflow-hidden text-ellipsis block">{line.description}</div>
                      {line.partNumber && <div className="text-[10px] text-[#64748b] block">Part: {line.partNumber}</div>}
                    </td>
                    <td className="py-4 px-3 text-right align-top">${line.rate.toFixed(2)}</td>
                    <td className="py-4 px-3 text-center align-top">{line.qty}</td>
                    <td className="py-4 px-3 text-right align-top">${line.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals First */}
            <div className="flex justify-end mb-8 pt-6 border-t border-[#f1f5f9]">
              <div className="w-1/3">
                <div className="flex justify-between text-xs font-bold text-[#2c394b] mb-4">
                  <span className="uppercase">Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
                <div className="bg-[#fdede3] py-3 px-3 -mx-3 rounded-sm flex justify-between items-center text-[#2c394b]">
                  <span className="text-[10px] font-bold uppercase">Balance Due</span>
                  <span className="text-base font-bold">{invoice.currency || 'USD'} ${invoice.status === 'paid' ? '0.00' : grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment & Terms Side by Side */}
            <div className="flex items-start pt-6 border-t border-[#f1f5f9]">
              {/* Payment Info Left */}
              <div className="flex-1 pr-6 border-r border-[#f1f5f9]">
                <h3 className="text-base font-bold text-[#2c394b] mb-4">Payment Info</h3>

                {invoice.paymentInstructions && (
                  <div className="mb-4">
                    <h4 className="text-[10px] font-bold text-[#64748b] uppercase mb-1">Payment Instructions</h4>
                    <p className="text-xs text-[#2c394b] whitespace-pre-line leading-relaxed">{invoice.paymentInstructions}</p>
                  </div>
                )}

                {bank && bank.bankName && (
                  <div>
                    <p className="text-xs text-[#2c394b] mb-1">{bank.bankName}</p>
                    {bank.accountNumber && <p className="text-xs text-[#2c394b] mb-1">{bank.accountNumber}</p>}
                    {bank.accountName && <p className="text-xs text-[#2c394b]">Account Name : {bank.accountName}</p>}
                  </div>
                )}
              </div>

              {/* Terms Right */}
              <div className="flex-1 pl-6">
                <h3 className="text-base font-bold text-[#2c394b] mb-4">Terms & Conditions</h3>
                {terms && terms.length > 0 ? (
                  <p className="text-xs text-[#64748b] leading-relaxed pr-4">
                    All purchases are subject to our standard terms and conditions. For full warranty, cancellation, and return policies, please refer to our service agreement.
                  </p>
                ) : (
                  <p className="text-[10px] text-[#64748b]">No additional terms provided.</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Angled Banner */}
          <div className="relative h-12 w-full overflow-hidden mt-6">
            <div className="absolute bottom-1 right-0 w-[400px] h-full bg-[#ee6c2b] transform origin-top-right -skew-x-[45deg]" />
            <div className="absolute bottom-1 right-[420px] w-12 h-full bg-[#f9bd99] transform origin-top-right -skew-x-[45deg]" />
            <div className="absolute bottom-1 right-[480px] w-8 h-full bg-[#f9bd99] transform origin-top-right -skew-x-[45deg]" />
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#ee6c2b]" />
          </div>
        </article>
      </div>
    </AppLayout>
  );
}
