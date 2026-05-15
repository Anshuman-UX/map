import { useEffect } from 'react';
import { useMapStore } from '../../store/mapStore';
import { FiCheck, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import type { AppToast } from '../../types';

function ToastItem({ toast }: { toast: AppToast }) {
  const { removeToast } = useMapStore();

  const config = {
    success: { icon: <FiCheck size={15} />, className: 'toast-success' },
    error:   { icon: <FiAlertCircle size={15} />, className: 'toast-error' },
    info:    { icon: <FiInfo size={15} />, className: 'toast-info' },
  }[toast.type];

  return (
    <div className={`toast ${config.className}`}>
      {config.icon}
      <span>{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', marginLeft: 8 }}
      >
        <FiX size={13} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useMapStore();

  return (
    <div
      style={{
        position: 'fixed', bottom: 24, right: 24,
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
        alignItems: 'flex-end',
        pointerEvents: toasts.length === 0 ? 'none' : 'auto',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
