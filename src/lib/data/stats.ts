import { DIETARY, maxParty } from "../types";
import type { Dietary, Guest, GuestCategory, RsvpStatus, Side } from "../types";

export interface GuestStats {
  /** Invitations (guest records). */
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  notContacted: number;
  /** People confirmed as coming. */
  attendees: number;
  adults: number;
  children: number;
  /** People invited across all invitations, plus-ones included. */
  invitedHeads: number;
  responded: number;
  /** 0–1: share of invitations that have an answer. */
  responseRate: number;
  /** 0–1: share of answers that are a yes. */
  acceptanceRate: number;
  meals: Record<Dietary, number>;
  seated: number;
}

export function computeStats(guests: Guest[]): GuestStats {
  const meals = Object.fromEntries(DIETARY.map((d) => [d, 0])) as Record<Dietary, number>;
  const stats: GuestStats = {
    total: guests.length,
    confirmed: 0,
    declined: 0,
    pending: 0,
    notContacted: 0,
    attendees: 0,
    adults: 0,
    children: 0,
    invitedHeads: 0,
    responded: 0,
    responseRate: 0,
    acceptanceRate: 0,
    meals,
    seated: 0,
  };
  for (const g of guests) {
    stats.invitedHeads += maxParty(g);
    if (g.status === "confirmed") {
      stats.confirmed++;
      stats.attendees += g.attendees;
      if (g.table) stats.seated += g.attendees;
      let kids = 0;
      for (const member of g.party) {
        meals[member.meal] = (meals[member.meal] ?? 0) + 1;
        if (member.isChild) kids++;
      }
      // Guests added by hand may have a headcount without named party members.
      const unnamed = Math.max(0, g.attendees - g.party.length);
      meals.regular += unnamed;
      stats.children += kids;
      stats.adults += g.attendees - kids;
    } else if (g.status === "declined") stats.declined++;
    else if (g.status === "pending") stats.pending++;
    else stats.notContacted++;
  }
  stats.responded = stats.confirmed + stats.declined;
  stats.responseRate = stats.total ? stats.responded / stats.total : 0;
  stats.acceptanceRate = stats.responded ? stats.confirmed / stats.responded : 0;
  return stats;
}

export const countByStatus = (guests: Guest[]): Record<RsvpStatus, number> => {
  const out: Record<RsvpStatus, number> = { confirmed: 0, declined: 0, pending: 0, not_contacted: 0 };
  for (const g of guests) out[g.status]++;
  return out;
};

export interface TimelinePoint {
  /** Start of the bucket, YYYY-MM-DD (local). */
  date: string;
  confirmed: number;
  declined: number;
  /** Running totals at the end of this bucket. */
  totalConfirmed: number;
  totalDeclined: number;
  totalAttendees: number;
}

const localDay = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Responses bucketed by day or week, from the first invitation to today.
 * Each guest counts once, at the time of their latest answer.
 */
export function responseTimeline(guests: Guest[], bucket: "day" | "week", now = new Date()): TimelinePoint[] {
  const answered = guests.filter((g) => g.lastResponseAt && (g.status === "confirmed" || g.status === "declined"));
  const sentTimes = guests.map((g) => g.invitationSentAt).filter(Boolean) as string[];
  const firstInstant = [...sentTimes, ...answered.map((g) => g.lastResponseAt as string)].sort()[0];
  if (!firstInstant) return [];

  const step = bucket === "day" ? 1 : 7;
  const start = new Date(firstInstant);
  start.setHours(0, 0, 0, 0);
  if (bucket === "week") start.setDate(start.getDate() - start.getDay()); // weeks start on Sunday
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);

  const points: TimelinePoint[] = [];
  const index = new Map<string, TimelinePoint>();
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + step)) {
    const point: TimelinePoint = {
      date: localDay(cursor),
      confirmed: 0,
      declined: 0,
      totalConfirmed: 0,
      totalDeclined: 0,
      totalAttendees: 0,
    };
    points.push(point);
    index.set(point.date, point);
  }

  const attendeesAt = new Map<string, number>();
  for (const g of answered) {
    const when = new Date(g.lastResponseAt as string);
    when.setHours(0, 0, 0, 0);
    if (bucket === "week") when.setDate(when.getDate() - when.getDay());
    const point = index.get(localDay(when));
    if (!point) continue;
    if (g.status === "confirmed") {
      point.confirmed++;
      attendeesAt.set(point.date, (attendeesAt.get(point.date) ?? 0) + g.attendees);
    } else point.declined++;
  }

  let totalConfirmed = 0;
  let totalDeclined = 0;
  let totalAttendees = 0;
  for (const point of points) {
    totalConfirmed += point.confirmed;
    totalDeclined += point.declined;
    totalAttendees += attendeesAt.get(point.date) ?? 0;
    point.totalConfirmed = totalConfirmed;
    point.totalDeclined = totalDeclined;
    point.totalAttendees = totalAttendees;
  }
  return points;
}

export interface GroupBreakdown {
  key: string;
  label: string;
  labelHe?: string;
  invitations: number;
  invitedHeads: number;
  confirmed: number;
  declined: number;
  pending: number;
  notContacted: number;
  attendees: number;
}

export function breakdownBy(
  guests: Guest[],
  dimension: "group" | "category" | "side",
): GroupBreakdown[] {
  const map = new Map<string, GroupBreakdown>();
  for (const g of guests) {
    const key: string = dimension === "group" ? g.group || "—" : dimension === "category" ? g.category : g.side;
    let row = map.get(key);
    if (!row) {
      row = {
        key,
        label: key,
        labelHe: dimension === "group" ? g.groupHe : undefined,
        invitations: 0,
        invitedHeads: 0,
        confirmed: 0,
        declined: 0,
        pending: 0,
        notContacted: 0,
        attendees: 0,
      };
      map.set(key, row);
    }
    row.invitations++;
    row.invitedHeads += maxParty(g);
    if (g.status === "confirmed") {
      row.confirmed++;
      row.attendees += g.attendees;
    } else if (g.status === "declined") row.declined++;
    else if (g.status === "pending") row.pending++;
    else row.notContacted++;
  }
  return [...map.values()].sort((a, b) => b.attendees - a.attendees || b.invitations - a.invitations);
}

export const CATEGORY_ORDER: GuestCategory[] = ["family", "friends", "work", "other"];
export const SIDE_ORDER: Side[] = ["bride", "groom", "both"];
