'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInvoices, dataOperations } from '@/lib/billing/data/useData';
import { useToast } from '@/lib/billing/toast/useToast';
import AppLayout from '@/components/billing/AppLayout';
import styles from './invoices.module.css';

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, loading } = useInvoices();
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    showToast(
      'info',
      'Delete this invoice? This cannot be undone.',
      0,
      {
        label: 'Delete',
        callback: () => {
          setDeletingId(id);
          try {
            dataOperations.deleteInvoice(id);
            showToast('success', 'Invoice deleted');
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } catch (error) {
            showToast('error', 'Failed to delete invoice');
          } finally {
            setDeletingId(null);
          }
        },
      },
      {
        label: 'Cancel',
        callback: () => { },
      }
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className={styles.page}>
          <header className={styles.header}>
            <div>
              <div className="h-8 w-40 bg-slate-200 rounded-md animate-pulse mb-2" />
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
          </header>

          <div className={`${styles.invoiceList} animate-pulse`}>
            {/* Skeleton Table Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
            {/* Skeleton Table Rows */}
            <div className="w-full">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-slate-100 last:border-0">
                  <div className="h-5 w-24 bg-slate-200 rounded" />
                  <div className="h-5 w-40 bg-slate-200 rounded" />
                  <div className="h-5 w-24 bg-slate-200 rounded" />
                  <div className="h-5 w-20 bg-slate-200 rounded" />
                  <div className="h-6 w-16 bg-slate-200 rounded-full" />
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-slate-200 rounded" />
                    <div className="h-8 w-20 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h2>All Invoices</h2>
            <p>{invoices.length} total</p>
          </div>
          <Link href="/portal/billing/invoices/create" className={styles.createBtn}>
            + Create Invoice
          </Link>
        </header>

        {invoices.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No invoices yet</p>
            <Link href="/portal/billing/invoices/create" className={styles.emptyLink}>
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className={styles.invoiceList}>
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const total = invoice.lineItems.reduce((sum, item) => sum + item.total, 0);
                  return (
                    <tr key={invoice.id}>
                      <td className={styles.invoiceId}>{invoice.id}</td>
                      <td>{invoice.customerName}</td>
                      <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td>{invoice.currency || 'USD'} {total.toFixed(2)}</td>
                      <td>
                        <span className={`${styles.status} ${styles[invoice.status]}`}>
                          {invoice.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Link
                            href={`/portal/billing/invoices/${invoice.id}`}
                            className={styles.viewBtn}
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(invoice.id)}
                            disabled={deletingId === invoice.id}
                            className={styles.deleteBtn}
                          >
                            {deletingId === invoice.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
