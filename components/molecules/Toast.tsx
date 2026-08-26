import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 4500;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  };

  const containerStyleMap: Record<ToastType, string> = {
    success: 'bg-white border-emerald-200 text-slate-900 shadow-lg shadow-emerald-950/5',
    error: 'bg-white border-rose-200 text-slate-900 shadow-lg shadow-rose-950/5',
    warning: 'bg-white border-amber-200 text-slate-900 shadow-lg shadow-amber-950/5',
    info: 'bg-white border-blue-200 text-slate-900 shadow-lg shadow-blue-950/5',
  };

  return (
    <div
      id={`toast-${toast.id}`}
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-2xl border ${containerStyleMap[toast.type]} min-w-[320px] max-w-md pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2 duration-200`}
    >
      {iconMap[toast.type]}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-sm font-bold text-slate-900">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer -mr-1 -mt-1"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notifications-container"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
