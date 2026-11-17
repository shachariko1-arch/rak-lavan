"use client";

import { useEffect, useState } from "react";

/** Ticks every `interval` ms. Returns null during SSR to avoid hydration mismatch. */
export function useNow(interval = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [interval]);
  return now;
}
