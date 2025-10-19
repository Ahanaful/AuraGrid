"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastOptions = {
  message: string;
  variant?: ToastVariant;
};

type ToastEntry = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  pushToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const pushToast = useCallback(({ message, variant = "info" }: ToastOptions) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[1000] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border-l-4 bg-slate-950/95 px-4 py-3 text-sm text-white shadow-lg shadow-slate-900/40 backdrop-blur ${
              toast.variant === "success"
                ? "border-emerald-400"
                : toast.variant === "error"
                ? "border-rose-500"
                : "border-slate-500"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
