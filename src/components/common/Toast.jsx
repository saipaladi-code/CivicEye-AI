import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short transition-all duration-300">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium ${
        toast.type === 'error'
          ? 'bg-rose-900/90 text-rose-100 border-rose-700'
          : 'bg-slate-900/95 text-white border-slate-700'
      }`}>
        {toast.type === 'error' ? (
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
