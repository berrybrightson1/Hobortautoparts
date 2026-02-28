'use client';

import { useTheme } from '@/lib/billing/theme/useTheme';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  fullWidth?: boolean;
}

export default function ThemeToggle({ fullWidth = false }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      className={`${styles.toggle} ${fullWidth ? styles.full : ''} ${isDark ? styles.dark : ''}`}
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={styles.track}>
        <span className={styles.thumb}></span>
      </span>
      <span className={styles.icons}>
        <span className={`${styles.icon} ${styles.sun}`} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        </span>
        <span className={`${styles.icon} ${styles.moon}`} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </span>
      </span>
    </button>
  );
}
