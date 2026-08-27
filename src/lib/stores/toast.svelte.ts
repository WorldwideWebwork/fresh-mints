export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'loading';
  duration?: number;
  action?: ToastAction;
}

class ToastStoreState {
  toasts = $state<ToastItem[]>([]);
  private timerMap = new Map<string, number>();

  show(toast: Omit<ToastItem, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { ...toast, id };
    this.toasts = [...this.toasts, newToast];

    if (toast.type !== 'loading') {
      const duration = toast.duration || 4500;
      const timer = window.setTimeout(() => {
        this.dismiss(id);
      }, duration);
      this.timerMap.set(id, timer);
    }

    return id;
  }

  loading(title: string, description?: string, action?: ToastAction): string {
    return this.show({ title, description, type: 'loading', action });
  }

  success(title: string, description?: string, action?: ToastAction): string {
    return this.show({ title, description, type: 'success', action });
  }

  error(title: string, description?: string, action?: ToastAction): string {
    return this.show({ title, description, type: 'error', action, duration: 6000 });
  }

  info(title: string, description?: string, action?: ToastAction): string {
    return this.show({ title, description, type: 'info', action });
  }

  warning(title: string, description?: string, action?: ToastAction): string {
    return this.show({ title, description, type: 'warning', action });
  }

  update(id: string, updates: Partial<Omit<ToastItem, 'id'>>) {
    const existingTimer = this.timerMap.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timerMap.delete(id);
    }

    this.toasts = this.toasts.map((t) => {
      if (t.id === id) {
        return { ...t, ...updates };
      }
      return t;
    });

    const updatedType = updates.type || this.toasts.find((t) => t.id === id)?.type;
    if (updatedType !== 'loading') {
      const duration = updates.duration || 4500;
      const timer = window.setTimeout(() => {
        this.dismiss(id);
      }, duration);
      this.timerMap.set(id, timer);
    }
  }

  dismiss(id: string) {
    const existingTimer = this.timerMap.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timerMap.delete(id);
    }
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}

export const toast = new ToastStoreState();

