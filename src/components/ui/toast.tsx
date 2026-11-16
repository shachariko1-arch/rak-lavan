"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tone = "success" | "info" | "error";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: Tone;
}

interface ToastApi {
  toast: (title: string, options?: { description?: string; tone?: Tone; duration?: number }) => void;
}

const ToastContext = createContext<ToastApi>({ toast: () => {} });

export const useToast = (): ToastApi => useContext(ToastContext);

const ICONS: Record<Tone, typeof Info> = { success: CircleCheck, info: Info, error: TriangleAlert };
const ICON_COLOR: Record<Tone, string> = {
  success: "text-confirmed",
  info: "text-gold-deep",
  error: "text-declined",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const { tr } = useI18n();
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback<ToastApi["toast"]>(
    (title, options) => {
      const id = nextId.current++;
      setItems((current) => [
        ...current.slice(-2),
        { id, title, description: options?.description, tone: options?.tone ?? "success" },
      ]);
      window.setTimeout(() => dismiss(id), options?.duration ?? 4200);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+5.25rem)] md:pb-6"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const Icon = ICONS[item.tone];
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-lift backdrop-blur"
              >
                <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", ICON_COLOR[item.tone])} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  {item.description ? <p className="mt-0.5 text-sm text-stone">{item.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  className="-m-1 rounded-full p-1 text-mist transition hover:bg-cream hover:text-ink"
                  aria-label={tr("Dismiss", "סגירה")}
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
