'use client';

import { ReactNode } from 'react';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout is now a lightweight wrapper for billing pages.
 * Authentication and navigation are handled by the parent HAPE portal layout.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.appContent}>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
