'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useInvoices } from '@/lib/billing/data/useData';
import AppLayout from '@/components/billing/AppLayout';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { invoices, loading } = useInvoices();

  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((inv) => inv.status === 'paid').length;
    const unpaid = invoices.filter((inv) => inv.status === 'balance_due').length;
    const revenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => {
        const invoiceTotal = inv.lineItems.reduce((s, item) => s + (item.total || 0), 0);
        return sum + invoiceTotal;
      }, 0);

    return { total, paid, unpaid, revenue };
  }, [invoices]);

  if (loading) {
    return (
      <AppLayout>
        <div className={styles.dashboard}>
          <header className={styles.header}>
            <div>
              <div className="h-8 w-40 bg-slate-200 rounded-md animate-pulse mb-2" />
              <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
          </header>

          {/* Stats Cards Skeleton */}
          <div className={styles.statsGrid}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-3" />
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Recent Invoices Skeleton */}
          <section className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-6" />

            <div className="w-full">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
              {/* Rows */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                  <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <h2>Dashboard</h2>
            <p>Overview of your invoicing activity</p>
          </div>
          <Link href="/portal/billing/invoices/create" className={styles.createBtn}>
            + Create Invoice
          </Link>
        </header>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Total Invoices</p>
              <h3 className={styles.statValue}>{stats.total}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Paid</p>
              <h3 className={styles.statValue}>{stats.paid}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Unpaid</p>
              <h3 className={styles.statValue}>{stats.unpaid}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Total Revenue</p>
              <h3 className={styles.statValue}>USD {stats.revenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <section className={styles.recentSection}>
          <h2>Recent Invoices</h2>
          {invoices.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No invoices yet</p>
              <Link href="/portal/billing/invoices/create" className={styles.emptyLink}>
                Create your first invoice
              </Link>
            </div>
          ) : (
            <div className={styles.invoiceTable}>
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 5).map((invoice) => (
                    <tr key={invoice.id}>
                      <td className={styles.invoiceId}>{invoice.id}</td>
                      <td>{invoice.customerName}</td>
                      <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`${styles.status} ${styles[invoice.status]}`}>
                          {invoice.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/portal/billing/invoices/${invoice.id}`}
                          className={styles.viewBtn}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {invoices.length > 0 && (
            <Link href="/portal/billing/invoices" className={styles.viewAllLink}>
              View All Invoices
            </Link>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
