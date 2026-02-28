'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/billing/AppLayout';
import { useInvoices, dataOperations, type Invoice, type InvoiceStatus } from '@/lib/billing/data/useData';
import { useToast } from '@/lib/billing/toast/useToast';
import styles from './finance.module.css';

type SortKey = 'date' | 'invoice' | 'client' | 'amount' | 'status';
type FilterType = 'all' | 'paid' | 'balance_due';

export default function FinancePage() {
  const { invoices } = useInvoices();
  const toast = useToast();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [exchangeRateInput, setExchangeRateInput] = useState('');

  const totalRevenue = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.lineItems.reduce((s, l) => s + l.total, 0), 0);
  }, [invoices]);

  const accountsReceivable = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'balance_due')
      .reduce((sum, inv) => sum + inv.lineItems.reduce((s, l) => s + l.total, 0), 0);
  }, [invoices]);

  const sourcingVolume = useMemo(() => {
    return invoices.reduce(
      (count, inv) => count + inv.lineItems.filter((l) => l.description === 'Part Purchase').length,
      0
    );
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    let list = [...invoices];
    if (filter !== 'all') list = list.filter((i) => i.status === filter);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'date':
          cmp = (a.createdAt || '').localeCompare(b.createdAt || '');
          break;
        case 'invoice':
          cmp = (a.id || '').localeCompare(b.id || '');
          break;
        case 'client':
          cmp = (a.customerName || '').localeCompare(b.customerName || '');
          break;
        case 'amount':
          cmp =
            a.lineItems.reduce((s, l) => s + l.total, 0) -
            b.lineItems.reduce((s, l) => s + l.total, 0);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [invoices, filter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const statusDisplay = (inv: Invoice): 'paid' | 'pending' | 'overdue' => {
    if (inv.status === 'paid') return 'paid';
    const today = new Date().toISOString().slice(0, 10);
    if (inv.dueDate && inv.dueDate < today) return 'overdue';
    return 'pending';
  };

  const handleSetStatus = async (id: string, status: InvoiceStatus) => {
    setUpdatingId(id);
    const rateStr = exchangeRateInput.trim();
    const rate = rateStr ? parseFloat(rateStr) : undefined;

    try {
      if (status === 'paid' && rate != null && !isNaN(rate)) {
        await dataOperations.setInvoiceStatus(id, status, { exchangeRate: rate });
        setExchangeRateInput('');
      } else {
        await dataOperations.setInvoiceStatus(id, status);
      }

      if (status === 'paid') {
        toast.success(`Payment for ${id} Confirmed`);
      } else {
        toast.success('Marked as balance due');
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const invoiceTotal = (inv: Invoice): number => {
    return inv.lineItems.reduce((s, l) => s + l.total, 0);
  };

  const bankDetails = dataOperations.getBankDetails();

  return (
    <AppLayout>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Finance Ledger</h1>
          <p className={styles.pageSubtitle}>Revenue, receivables, and banking.</p>
        </header>

        {/* Stats */}
        <section className={styles.financeStats}>
          <div className={`${styles.statCard} ${styles.revenue}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <div className={styles.statBody}>
              <span className={styles.statLabel}>Total Revenue</span>
              <span className={styles.statValue}>
                {totalRevenue.toFixed(2)} <span className={styles.statUnit}>USD</span>
              </span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.receivable}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <div className={styles.statBody}>
              <span className={styles.statLabel}>Accounts Receivable</span>
              <span className={styles.statValue}>
                {accountsReceivable.toFixed(2)} <span className={styles.statUnit}>USD</span>
              </span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.sourcing}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <div className={styles.statBody}>
              <span className={styles.statLabel}>Sourcing Volume</span>
              <span className={styles.statValue}>{sourcingVolume}</span>
              <span className={styles.statMeta}>Part Purchase line items</span>
            </div>
          </div>
        </section>

        {/* Ledger Table */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Ledger</h2>
            <div className={styles.filterTabs}>
              <button
                type="button"
                className={`${styles.tab} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`${styles.tab} ${filter === 'paid' ? styles.active : ''}`}
                onClick={() => setFilter('paid')}
              >
                Paid
              </button>
              <button
                type="button"
                className={`${styles.tab} ${filter === 'balance_due' ? styles.active : ''}`}
                onClick={() => setFilter('balance_due')}
              >
                Balance Due
              </button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><button onClick={() => handleSort('date')} className={styles.thSort}>Date</button></th>
                  <th><button onClick={() => handleSort('invoice')} className={styles.thSort}>Invoice #</button></th>
                  <th><button onClick={() => handleSort('client')} className={styles.thSort}>Client Name</button></th>
                  <th><button onClick={() => handleSort('amount')} className={styles.thSort}>Amount (USD)</button></th>
                  <th><button onClick={() => handleSort('status')} className={styles.thSort}>Status</button></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.tableEmpty}>No invoices.</td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.createdAt}</td>
                      <td>
                        <Link href={`/portal/billing/invoices/${inv.id}`} className={styles.link}>
                          {inv.id}
                        </Link>
                      </td>
                      <td>{inv.customerName}</td>
                      <td>{invoiceTotal(inv).toFixed(2)}</td>
                      <td>
                        <span className={`${styles.status} ${styles[statusDisplay(inv)]}`}>
                          {statusDisplay(inv) === 'paid' && 'Paid'}
                          {statusDisplay(inv) === 'overdue' && 'Overdue'}
                          {statusDisplay(inv) === 'pending' && 'Pending'}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <Link href={`/portal/billing/invoices/${inv.id}`} className={styles.btnSm}>
                          View
                        </Link>
                        {inv.status === 'balance_due' ? (
                          <button
                            type="button"
                            className={`${styles.btnSm} ${styles.btnPaid}`}
                            onClick={() => handleSetStatus(inv.id, 'paid')}
                            disabled={updatingId !== null}
                          >
                            {updatingId === inv.id ? 'Updating…' : 'Mark paid'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.btnSm} ${styles.btnUnpaid}`}
                            onClick={() => handleSetStatus(inv.id, 'balance_due')}
                            disabled={updatingId !== null}
                          >
                            {updatingId === inv.id ? 'Updating…' : 'Mark unpaid'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Banking */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Banking & Disbursement</h2>
          <div className={styles.bankingCards}>
            <div className={styles.bankingCard}>
              <h3 className={styles.bankingCardTitle}>Bank (Cedi account)</h3>
              <p className={styles.bankingCardDesc}>Total collected (USD) funneled via this account.</p>
              <p className={styles.bankingCardAmount}>
                {totalRevenue.toFixed(2)} <span className={styles.bankingCardUnit}>USD</span>
              </p>
              {bankDetails.bankName && (
                <p className={styles.bankingCardDetail}>
                  {bankDetails.bankName}
                  {bankDetails.accountNumber && ` ${bankDetails.accountNumber}`}
                  {bankDetails.accountName && ` (${bankDetails.accountName})`}
                </p>
              )}
            </div>

            <div className={`${styles.bankingCard} ${styles.conversion}`}>
              <h3 className={styles.bankingCardTitle}>Conversion at payment</h3>
              <p className={styles.bankingCardDesc}>
                When marking an invoice as Paid, enter the USD→Cedi rate used for bookkeeping.
              </p>
              <div className={styles.exchangeRateInline}>
                <label className={styles.exchangeRateLabel} htmlFor="finance-rate">
                  Rate (e.g. 12.5):
                </label>
                <input
                  id="finance-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  className={styles.exchangeRateInput}
                  placeholder="Optional"
                  value={exchangeRateInput}
                  onChange={(e) => setExchangeRateInput(e.target.value)}
                />
              </div>
              <p className={styles.bankingCardHint}>Rate is saved to Exchange Rate History when you Mark paid.</p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
