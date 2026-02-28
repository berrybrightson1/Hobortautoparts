'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './PresetDropdown.module.css';

export interface PresetOption {
  id: string;
  label: string;
}

const PRESETS: PresetOption[] = [
  { id: 'standard', label: 'Standard: 10% tax, 30 days due' },
  { id: 'ghs', label: 'GHS: Ghana cedi, 30 days' },
  { id: 'net15', label: 'Net 15: Due in 15 days' },
];

interface PresetDropdownProps {
  onPresetSelect: (id: string) => void;
}

export default function PresetDropdown({ onPresetSelect }: PresetDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = () => setOpen(!open);

  const select = (id: string) => {
    onPresetSelect(id);
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
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={styles.triggerLabel}>Apply a preset…</span>
        <svg className={styles.triggerArrow} width="12" height="12" viewBox="0 0 12 12">
          <path fill="currentColor" d="M6 8L1 3h10z"/>
        </svg>
      </button>
      {open && (
        <div className={styles.panel}>
          {PRESETS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={styles.option}
              onClick={() => select(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
