import React, { createContext, useCallback, useContext, useState } from "react";
import type { ToastType } from "../../ui/Toast";
import Toast from "../../ui/Toast";

interface ToastOptions {
  type: ToastType;
  label: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions & { visible: boolean }>({
    visible: false,
    type: "success",
    label: "",
  });

  const showToast = useCallback((options: ToastOptions) => {
    setToast({ ...options, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={toast.visible}
        type={toast.type}
        label={toast.label}
        duration={toast.duration}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
