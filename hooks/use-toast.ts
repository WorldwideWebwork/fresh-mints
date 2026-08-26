import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/molecules/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    ({
      type,
      title,
      description,
      action,
      duration = 4500,
    }: {
      type: ToastType;
      title: string;
      description?: string;
      action?: { label: string; onClick: () => void };
      duration?: number;
    }) => {
      const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newToast: ToastMessage = {
        id,
        type,
        title,
        description,
        action,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    dismissToast,
    clearAllToasts,
  };
}
