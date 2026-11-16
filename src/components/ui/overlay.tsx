"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

let openLayers = 0;

/** Shared dialog behaviour: scroll lock, Escape, focus trap, focus restore. */
function useDialog(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    openLayers++;
    document.documentElement.style.overflow = "hidden";

    const focusFirst = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel || panel.contains(document.activeElement)) return;
      const target = panel.querySelector<HTMLElement>("[data-autofocus]") ?? panel.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? panel).focus({ preventScroll: true });
    }, 30);

    const onKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener("keydown", onKeyDown, true);
      openLayers = Math.max(0, openLayers - 1);
      if (openLayers === 0) document.documentElement.style.overflow = "";
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return panelRef;
}

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Hide the heading visually while keeping it for screen readers. */
  hideTitle?: boolean;
  className?: string;
}

const MODAL_WIDTH = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl" };

/** Centered dialog on desktop, bottom sheet on phones. */
export function Modal({ open, onClose, title, description, children, footer, size = "md", hideTitle, className }: ModalProps) {
  const { tr } = useI18n();
  const panelRef = useDialog(open, onClose);
  const titleId = useId();

  return (
    <Portal>
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.985 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className={cn(
                "relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[28px] bg-ivory shadow-lift outline-none sm:rounded-[28px]",
                MODAL_WIDTH[size],
                className,
              )}
            >
              <div className={cn("flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-7", hideTitle && "sr-only")}>
                <div className="min-w-0">
                  <h2 id={titleId} className="font-serif text-[26px] leading-tight text-ink he:text-2xl">
                    {title}
                  </h2>
                  {description ? <p className="mt-1.5 text-sm leading-relaxed text-stone">{description}</p> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={tr("Close", "סגירה")}
                className="absolute end-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/70 text-stone backdrop-blur transition hover:bg-white hover:text-ink sm:end-5 sm:top-5"
              >
                <X className="size-[18px]" />
              </button>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">{children}</div>
              {footer ? (
                <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-line bg-cream/50 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-8 sm:pb-4">
                  {footer}
                </div>
              ) : null}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

/** Side sheet that slides in from the trailing edge (left in Hebrew, right in English). */
export function Drawer({ open, onClose, title, children, footer, width = "sm:max-w-md" }: DrawerProps) {
  const { tr, isRtl } = useI18n();
  const panelRef = useDialog(open, onClose);
  const titleId = useId();
  const offscreen = isRtl ? "-100%" : "100%";

  return (
    <Portal>
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              initial={{ x: offscreen }}
              animate={{ x: 0 }}
              exit={{ x: offscreen }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              className={cn("relative flex h-full w-full flex-col bg-ivory shadow-lift outline-none", width)}
            >
              <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
                <h2 id={titleId} className="min-w-0 truncate font-serif text-2xl text-ink he:text-xl">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={tr("Close", "סגירה")}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-stone transition hover:bg-cream hover:text-ink"
                >
                  <X className="size-[18px]" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
              {footer ? (
                <div className="flex flex-wrap items-center gap-2.5 border-t border-line bg-cream/50 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  {footer}
                </div>
              ) : null}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

interface MenuProps {
  /** The trigger. Receives the props it needs to open the menu. */
  trigger: (props: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "menu" }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  className?: string;
}

/** Small dropdown menu. Closes on outside click, Escape, and when its page is hidden. */
export function Menu({ trigger, children, align = "end", className }: MenuProps) {
  const { isRtl } = useI18n();
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ top: number; left?: number; right?: number; up: boolean } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useLayoutEffect(() => () => setOpen(false), []);

  // The menu is portalled and fixed, so scroll containers (tables) never clip it.
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const up = rect.bottom + 260 > window.innerHeight && rect.top > 260;
    const toRight = (align === "end") !== isRtl;
    setBox({
      top: up ? rect.top - 8 : rect.bottom + 8,
      up,
      ...(toRight ? { right: Math.max(8, window.innerWidth - rect.right) } : { left: Math.max(8, rect.left) }),
    });
  }, [open, align, isRtl]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        rootRef.current?.querySelector<HTMLElement>("button")?.focus();
      }
    };
    const onScroll = (event: Event) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  useEffect(() => {
    if (open && box) menuRef.current?.querySelector<HTMLElement>("[role=menuitem]:not([disabled])")?.focus();
  }, [open, box]);

  const onMenuKey = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Tab") return;
    if (event.key === "Tab") return setOpen(false);
    event.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]:not([disabled])") ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
  };

  return (
    <div ref={rootRef} className="relative inline-flex">
      {trigger({ onClick: () => setOpen((v) => !v), "aria-expanded": open, "aria-haspopup": "menu" })}
      <Portal>
        <AnimatePresence>
          {open && box ? (
            <motion.div
              ref={menuRef}
              role="menu"
              onKeyDown={onMenuKey}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              style={{ position: "fixed", top: box.top, left: box.left, right: box.right, translateY: box.up ? "-100%" : 0 }}
              className={cn("z-[110] min-w-[13rem] overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lift", className)}
            >
              {children(close)}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </div>
  );
}

interface MenuItemProps {
  onSelect: () => void;
  icon?: ReactNode;
  children: ReactNode;
  tone?: "default" | "danger";
  disabled?: boolean;
}

export function MenuItem({ onSelect, icon, children, tone = "default", disabled }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start text-sm transition-colors disabled:opacity-40",
        tone === "danger" ? "text-declined hover:bg-declined-soft" : "text-ink-soft hover:bg-cream",
      )}
    >
      {icon ? <span className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-4">{icon}</span> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}
