'use client';

import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'hobort-theme';

let currentTheme: ThemeMode = 'light';
const listeners: Set<(theme: ThemeMode) => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(currentTheme));
}

function applyTheme(theme: ThemeMode) {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('dark', theme === 'dark');
  }
}

function loadTheme(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
}

function saveTheme(theme: ThemeMode) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme);
  }
}

export function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(currentTheme);
  saveTheme(currentTheme);
  notifyListeners();
}

export function setTheme(theme: ThemeMode) {
  currentTheme = theme;
  applyTheme(currentTheme);
  saveTheme(currentTheme);
  notifyListeners();
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      currentTheme = loadTheme();
      applyTheme(currentTheme);
      return currentTheme;
    }
    return 'light';
  });

  useEffect(() => {
    const listener = (newTheme: ThemeMode) => setThemeState(newTheme);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggle: toggleTheme,
    setTheme,
  };
}
