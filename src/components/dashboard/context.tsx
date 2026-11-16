"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useToast } from "@/components/ui/toast";
import { getRepository } from "@/lib/data";
import { computeStats } from "@/lib/data/stats";
import type { GuestStats } from "@/lib/data/stats";
import { useI18n } from "@/lib/i18n";
import { guestDisplayName } from "@/lib/messaging/templates";
import type { Guest, Session, Wedding } from "@/lib/types";

interface DashboardData {
  ready: boolean;
  mode: "demo" | "supabase";
  session: Session | null;
  weddings: Wedding[];
  wedding: Wedding | null;
  guests: Guest[];
  stats: GuestStats;
  /** Guests whose RSVP just changed from outside this tab, for row highlights. */
  liveIds: Set<string>;
  selectWedding: (id: string) => void;
  saveWedding: (wedding: Wedding) => Promise<Wedding>;
  saveGuests: (guests: Guest[]) => Promise<void>;
  patchGuests: (ids: string[], patch: (guest: Guest) => Guest) => Promise<void>;
  removeGuests: (ids: string[]) => Promise<void>;
  resetDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<DashboardData | null>(null);

export function useDashboard(): DashboardData {
  const value = useContext(Ctx);
  if (!value) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return value;
}

const ACTIVE_KEY = "vow.activeWedding";

/** Loads the signed-in couple's wedding and guests, keeps them live, and exposes mutations. */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const repo = getRepository();
  const router = useRouter();
  const { href, tr, locale } = useI18n();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());
  const guestsRef = useRef<Guest[]>([]);
  const localWrite = useRef(0);

  // Session → weddings
  useEffect(() => {
    let alive = true;
    const load = async (next: Session | null) => {
      if (!alive) return;
      setSession(next);
      if (!next) {
        setReady(true);
        router.replace(href("/login"));
        return;
      }
      const list = await repo.listWeddings().catch(() => []);
      if (!alive) return;
      setWeddings(list);
      const saved = window.localStorage.getItem(ACTIVE_KEY);
      setActiveId((current) => current ?? list.find((w) => w.id === saved)?.id ?? list[list.length - 1]?.id ?? null);
      setReady(true);
    };
    void repo.getSession().then(load);
    const off = repo.onAuthChange((next) => void load(next));
    return () => {
      alive = false;
      off();
    };
  }, [repo, router, href]);

  // Guests of the active wedding, kept live
  useEffect(() => {
    if (!activeId || !session) return;
    let alive = true;
    const refresh = async (external: boolean) => {
      const next = await repo.listGuests(activeId).catch(() => null);
      if (!alive || !next) return;
      if (external && Date.now() - localWrite.current > 1500) {
        const before = new Map(guestsRef.current.map((g) => [g.id, g]));
        const changed = next.filter((g) => {
          const old = before.get(g.id);
          return g.lastResponseAt && (!old || old.lastResponseAt !== g.lastResponseAt);
        });
        if (changed.length) {
          setLiveIds(new Set(changed.map((g) => g.id)));
          window.setTimeout(() => alive && setLiveIds(new Set()), 6000);
          const g = changed[0];
          const name = guestDisplayName(g, locale);
          toast(
            g.status === "confirmed"
              ? tr(`${name} just confirmed`, `${name} אישר/ה הגעה`)
              : tr(`${name} just declined`, `${name} עדכן/ה שלא יגיע/ו`),
            { description: g.status === "confirmed" ? tr(`${g.attendees} attending`, `${g.attendees} מגיעים`) : undefined, tone: "info" },
          );
        }
      }
      guestsRef.current = next;
      setGuests(next);
    };
    void refresh(false);
    const off = repo.subscribeGuests(activeId, () => void refresh(true));
    return () => {
      alive = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, session, repo]);

  const apply = useCallback((next: Guest[]) => {
    guestsRef.current = next;
    setGuests(next);
    localWrite.current = Date.now();
  }, []);

  const saveGuests = useCallback(
    async (changed: Guest[]) => {
      const byId = new Map(changed.map((g) => [g.id, g]));
      const merged = guestsRef.current.map((g) => byId.get(g.id) ?? g);
      const existing = new Set(guestsRef.current.map((g) => g.id));
      apply([...merged, ...changed.filter((g) => !existing.has(g.id))]);
      await repo.upsertGuests(changed);
    },
    [repo, apply],
  );

  const patchGuests = useCallback(
    async (ids: string[], patch: (guest: Guest) => Guest) => {
      const wanted = new Set(ids);
      await saveGuests(guestsRef.current.filter((g) => wanted.has(g.id)).map(patch));
    },
    [saveGuests],
  );

  const removeGuests = useCallback(
    async (ids: string[]) => {
      if (!activeId) return;
      const doomed = new Set(ids);
      apply(guestsRef.current.filter((g) => !doomed.has(g.id)));
      await repo.deleteGuests(activeId, ids);
    },
    [repo, activeId, apply],
  );

  const saveWedding = useCallback(
    async (wedding: Wedding) => {
      const saved = await repo.saveWedding(wedding);
      setWeddings((list) => (list.some((w) => w.id === saved.id) ? list.map((w) => (w.id === saved.id ? saved : w)) : [...list, saved]));
      return saved;
    },
    [repo],
  );

  const value = useMemo<DashboardData>(
    () => ({
      ready,
      mode: repo.mode,
      session,
      weddings,
      wedding: weddings.find((w) => w.id === activeId) ?? null,
      guests,
      stats: computeStats(guests),
      liveIds,
      selectWedding: (id) => {
        window.localStorage.setItem(ACTIVE_KEY, id);
        setGuests([]);
        guestsRef.current = [];
        setActiveId(id);
      },
      saveWedding,
      saveGuests,
      patchGuests,
      removeGuests,
      resetDemo: async () => {
        await repo.resetDemo?.();
        const list = await repo.listWeddings();
        setWeddings(list);
        setActiveId(list[0]?.id ?? null);
      },
      signOut: async () => {
        await repo.signOut();
      },
    }),
    [ready, repo, session, weddings, activeId, guests, liveIds, saveWedding, saveGuests, patchGuests, removeGuests],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
