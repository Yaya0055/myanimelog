import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const typeStyles = {
  success: 'bg-neon-green/15 border-neon-green/30 text-neon-green',
  error: 'bg-neon-red/15 border-neon-red/30 text-neon-red',
  info: 'bg-ocean/15 border-ocean/30 text-ocean-light',
};

const typeIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export default function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = typeIcons[toast.type] || CheckCircle;
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl animate-slide-in-right shadow-2xl shadow-black/30 ${typeStyles[toast.type] || typeStyles.success}`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 hover:opacity-70 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
