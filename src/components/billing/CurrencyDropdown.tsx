'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './CurrencyDropdown.module.css';

export interface CurrencyOption {
  code: string;
  label: string;
}

interface CurrencyDropdownProps {
  options: CurrencyOption[];
  value: string;
  onChange: (code: string) => void;
}

export default function CurrencyDropdown({ options, value, onChange }: CurrencyDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.code === value)?.label ?? value;

  const toggle = () => setOpen(!open);

  const select = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        type="button"
        id="currency"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={styles.triggerLabel}>{selectedLabel}</span>
        <svg className={styles.triggerArrow} width="12" height="12" viewBox="0 0 12 12">
          <path fill="currentColor" d="M6 8L1 3h10z"/>
        </svg>
      </button>
      {open && (
        <div className={styles.panel}>
          {options.map((opt) => (
            <button
              key={opt.code}
              type="button"
              className={`${styles.option} ${opt.code === value ? styles.optionSelected : ''}`}
              onClick={() => select(opt.code)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
