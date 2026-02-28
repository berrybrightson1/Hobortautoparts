// Toast notifications - converted to wrap sonner for global consistency
'use client';

import { toast as sonnerToast } from 'sonner';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  callback: () => void;
}

const DEFAULT_DURATION_MS = 4000;

export function showToast(
  type: ToastType,
  message: string,
  duration = DEFAULT_DURATION_MS,
  action?: ToastAction,
  secondaryAction?: ToastAction
): string {
  const options: any = { duration };

  if (action) {
    options.action = {
      label: action.label,
      onClick: action.callback,
    };
  }

  // Sonner doesn't natively support a secondary action via a prop as simply,
  // but we can map it to cancel if needed, or just let users rely on the primary action.
  if (secondaryAction && !options.cancel) {
    options.cancel = {
      label: secondaryAction.label,
      onClick: secondaryAction.callback,
    };
  }

  let toastId: string | number;

  switch (type) {
    case 'success':
      toastId = sonnerToast.success(message, options);
      break;
    case 'error':
      toastId = sonnerToast.error(message, options);
      break;
    case 'warning':
      toastId = sonnerToast.warning(message, options);
      break;
    case 'info':
    default:
      toastId = sonnerToast.info(message, options);
      break;
  }

  return toastId.toString();
}

export function dismissToast(id: string) {
  sonnerToast.dismiss(id);
}

// Helper hooks
export function useToast() {
  return {
    showToast,
    success: (message: string, duration?: number) => showToast('success', message, duration),
    error: (message: string, duration?: number) => showToast('error', message, duration),
    info: (message: string, duration?: number) => showToast('info', message, duration),
    warning: (message: string, duration?: number) => showToast('warning', message, duration),
  };
}
