"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Ellipsis, Eye, FileSpreadsheet, MailCheck, MessageCircle, Pencil, Search, Trash2, Upload, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox, Select } from "@/components/ui/form";
import { Avatar, Card, EmptyState, StatusBadge, STATUS_STYLE, Tabs } from "@/components/ui/misc";
import { Menu, MenuItem, Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { countByStatus } from "@/lib/data/stats";
import { dietarySummary, exportRows, toCsv, toXlsx } from "@/lib/guest-io";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABEL } from "@/lib/labels";
import { buildGuestMessage, guestDisplayName } from "@/lib/messaging/templates";
import { getMessagingProvider } from "@/lib/messaging/provider";
import { currentOrigin, inviteUrl } from "@/lib/site";
import { GUEST_CATEGORIES, maxParty } from "@/lib/types";
import type { Guest, GuestCategory, RsvpStatus } from "@/lib/types";
import { cn, downloadBlob, formatDateTime, formatPhone, normalizePhone } from "@/lib/utils";
import { useDashboard } from "./context";
import { GuestDrawer, GuestFormModal, ImportModal } from "./guest-dialogs";
import { PageHeader } from "./shell";

type TabKey = "all" | RsvpStatus;
type SortKey = "name" | "response" | "sent" | "attendees";
const PAGE_SIZE = 25;

export function GuestsPage() {
  const { tr, locale, pick, isRtl } = useI18n();
  const { wedding, guests, liveIds, saveGuests, patchGuests, removeGuests } = useDashboard();
  const { toast } = useToast();

  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GuestCategory | "">("");
  const [group, setGroup] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<{ open: boolean; guest: Guest | null }>({ open: false, guest: null });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);

  const counts = useMemo(() => countByStatus(guests), [guests]);
  const groups = useMemo(() => [...new Set(guests.map((g) => g.group).filter(Boolean))].sort(), [guests]);
  const groupLabel = useMemo(() => new Map(guests.map((g) => [g.group, (locale === "he" && g.groupHe) || g.group])), [guests, locale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = normalizePhone(query).replace(/^972/, "");
    const rawDigits = query.replace(/\D/g, "").replace(/^0/, "");
    const list = guests.filter((g) => {
      if (tab !== "all" && g.status !== tab) return false;
      if (category && g.category !== category) return false;
      if (group && g.group !== group) return false;
      if (!q) return true;
      if (g.name.toLowerCase().includes(q) || g.nameHe?.includes(q)) return true;
      return rawDigits.length >= 3 && (g.phone.includes(rawDigits) || (digits.length >= 3 && g.phone.includes(digits)));
    });
    const collator = new Intl.Collator(locale);
    const value = (g: Guest): string | number =>
      sort.key === "name" ? guestDisplayName(g, locale) : sort.key === "response" ? (g.lastResponseAt ?? "") : sort.key === "sent" ? (g.invitationSentAt ?? "") : g.attendees;
    return list.sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      // Guests without a date always sink to the bottom.
      if (va === "" && vb !== "") return 1;
      if (vb === "" && va !== "") return -1;
      const cmp = typeof va === "number" ? va - (vb as number) : collator.compare(va, vb as string);
      return cmp * sort.dir || collator.compare(a.name, b.name);
    });
  }, [guests, tab, category, group, query, sort, locale]);

  useEffect(() => setPage(0), [tab, category, group, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const detail = guests.find((g) => g.id === detailId) ?? null;

  if (!wedding) return null;

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allVisible = visible.length > 0 && visible.every((g) => selected.has(g.id));
  const someVisible = visible.some((g) => selected.has(g.id));
  const toggleVisible = () => setSelected((s) => { const n = new Set(s); visible.forEach((g) => (allVisible ? n.delete(g.id) : n.add(g.id))); return n; });
  const chosen = guests.filter((g) => selected.has(g.id));

  const markSent = async (ids: string[]) => {
    const now = new Date().toISOString();
    await patchGuests(ids, (g) => ({ ...g, invitationSentAt: g.invitationSentAt ?? now, status: g.status === "not_contacted" ? "pending" : g.status }));
    toast(tr(`${ids.length} marked as sent`, `${ids.length} סומנו כנשלחו`));
  };

  const message = async (g: Guest) => {
    if (!g.phone) return toast(tr("This guest has no phone number", "לאורח הזה אין מספר טלפון"), { tone: "error" });
    const kind = g.status === "not_contacted" ? "invite" : "reminder";
    const result = await getMessagingProvider().send({ guestId: g.id, phone: g.phone, text: buildGuestMessage(kind, wedding, g, wedding.language, currentOrigin()) });
    if (!result.ok) return toast(tr("The message could not be sent", "ההודעה לא נשלחה"), { tone: "error" });
    const now = new Date().toISOString();
    await patchGuests([g.id], (x) => (kind === "invite" ? { ...x, status: "pending", invitationSentAt: now } : { ...x, remindersSent: x.remindersSent + 1 }));
  };

  const exportList = async (format: "csv" | "xlsx", list: Guest[]) => {
    const rows = exportRows(list, locale, (g) => inviteUrl(currentOrigin(), wedding.slug, g.token));
    const blob = format === "csv" ? toCsv(rows) : await toXlsx(rows);
    downloadBlob(blob, `${wedding.slug}-guests.${format}`);
    toast(tr(`${list.length} guests exported`, `${list.length} אורחים יוצאו`));
  };

  const SortHead = ({ k, children, className }: { k: SortKey; children: React.ReactNode; className?: string }) => {
    const active = sort.key === k;
    const Icon = !active ? ArrowUpDown : sort.dir === 1 ? ArrowUp : ArrowDown;
    return (
      <th scope="col" aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={cn("px-2.5 py-3 text-start font-medium", className)}>
        <button type="button" onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : k === "name" ? 1 : -1 }))} className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded hover:text-ink", active && "text-ink")}>
          {children}
          <Icon aria-hidden className={cn("size-3.5", !active && "opacity-40")} />
        </button>
      </th>
    );
  };
  const Th = ({ children, className }: { children?: React.ReactNode; className?: string }) => <th scope="col" className={cn("whitespace-nowrap px-3 py-3 text-start font-medium", className)}>{children}</th>;

  const rowActions = (g: Guest) => (
    <Menu
      trigger={(props) => (
        <IconButton {...props} size="sm" label={tr(`Actions for ${g.name}`, `פעולות עבור ${guestDisplayName(g, locale)}`)}><Ellipsis className="size-4" /></IconButton>
      )}
    >
      {(close) => (
        <>
          <MenuItem icon={<Eye />} onSelect={() => { setDetailId(g.id); close(); }}>{tr("View details", "צפייה בפרטים")}</MenuItem>
          <MenuItem icon={<Pencil />} onSelect={() => { setForm({ open: true, guest: g }); close(); }}>{tr("Edit", "עריכה")}</MenuItem>
          <MenuItem icon={<MessageCircle />} disabled={!g.phone} onSelect={() => { void message(g); close(); }}>
            {g.status === "not_contacted" ? tr("Send invitation on WhatsApp", "שליחת הזמנה בוואטסאפ") : tr("Send WhatsApp reminder", "שליחת תזכורת בוואטסאפ")}
          </MenuItem>
          {!g.invitationSentAt ? <MenuItem icon={<MailCheck />} onSelect={() => { void markSent([g.id]); close(); }}>{tr("Mark invitation as sent", "סימון ההזמנה כנשלחה")}</MenuItem> : null}
          <MenuItem icon={<Trash2 />} tone="danger" onSelect={() => { setConfirmDelete([g.id]); close(); }}>{tr("Delete", "מחיקה")}</MenuItem>
        </>
      )}
    </Menu>
  );

  const Prev = isRtl ? ChevronRight : ChevronLeft;
  const Next = isRtl ? ChevronLeft : ChevronRight;

  return (
    <>
      <PageHeader
        eyebrow={tr("Guest list", "רשימת האורחים")}
        title={tr("Guests", "אורחים")}
        actions={
          <>
            <Button variant="outline" size="sm" icon={<Upload className="size-3.5" />} onClick={() => setImporting(true)}>{tr("Import", "ייבוא")}</Button>
            <Menu trigger={(props) => <Button {...props} variant="outline" size="sm" icon={<Download className="size-3.5" />}>{tr("Export", "ייצוא")}</Button>}>
              {(close) => (
                <>
                  <MenuItem icon={<FileSpreadsheet />} onSelect={() => { void exportList("xlsx", filtered); close(); }}>{tr("Excel (.xlsx)", "Excel ‏(‎.xlsx)")}</MenuItem>
                  <MenuItem icon={<Download />} onSelect={() => { void exportList("csv", filtered); close(); }}>{tr("CSV (.csv)", "CSV ‏(‎.csv)")}</MenuItem>
                </>
              )}
            </Menu>
            <Button size="sm" icon={<UserPlus className="size-3.5" />} onClick={() => setForm({ open: true, guest: null })}>{tr("Add guest", "הוספת אורח")}</Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="px-3 pt-3 sm:px-5">
          <Tabs<TabKey>
            label={tr("Filter by RSVP status", "סינון לפי סטטוס")}
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "all", label: tr("All guests", "כל האורחים"), count: guests.length },
              { value: "confirmed", label: tr("Confirmed", "אישרו"), count: counts.confirmed, dot: STATUS_STYLE.confirmed.dot },
              { value: "declined", label: tr("Declined", "סירבו"), count: counts.declined, dot: STATUS_STYLE.declined.dot },
              { value: "pending", label: tr("Pending", "ממתינים"), count: counts.pending, dot: STATUS_STYLE.pending.dot },
              { value: "not_contacted", label: tr("Not contacted", "לא נשלח"), count: counts.not_contacted, dot: STATUS_STYLE.not_contacted.dot },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-3 py-3 sm:px-5">
          <div className="relative min-w-52 flex-1">
            <Search aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-mist" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={tr("Search guests by name or phone", "חיפוש אורחים לפי שם או טלפון")}
              placeholder={tr("Search by name or phone…", "חיפוש לפי שם או טלפון…")}
              className="h-10 w-full rounded-full border border-line bg-white/80 pe-4 ps-10 text-sm placeholder:text-mist focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
            />
          </div>
          <div className="w-36">
            <Select compact aria-label={tr("Category", "קטגוריה")} value={category} onChange={(e) => setCategory(e.target.value as GuestCategory | "")}>
              <option value="">{tr("All categories", "כל הקטגוריות")}</option>
              {GUEST_CATEGORIES.map((c) => <option key={c} value={c}>{pick(CATEGORY_LABEL[c])}</option>)}
            </Select>
          </div>
          <div className="w-48">
            <Select compact aria-label={tr("Group", "קבוצה")} value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="">{tr("All groups", "כל הקבוצות")}</option>
              {groups.map((g) => <option key={g} value={g}>{groupLabel.get(g)}</option>)}
            </Select>
          </div>
          <p className="ms-auto text-xs text-stone" role="status">{tr(`${filtered.length} guests`, `${filtered.length} אורחים`)}</p>
        </div>

        {selected.size ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-ink px-3 py-2.5 text-ivory sm:px-5">
            <p className="me-2 text-sm font-medium">{tr(`${selected.size} selected`, `${selected.size} נבחרו`)}</p>
            <Button size="sm" variant="light" icon={<MailCheck className="size-3.5" />} onClick={() => void markSent([...selected])}>{tr("Mark as sent", "סימון כנשלח")}</Button>
            <Button size="sm" variant="light" icon={<Download className="size-3.5" />} onClick={() => void exportList("xlsx", chosen)}>{tr("Export", "ייצוא")}</Button>
            <Button size="sm" variant="light" icon={<Trash2 className="size-3.5" />} onClick={() => setConfirmDelete([...selected])}>{tr("Delete", "מחיקה")}</Button>
            <button type="button" onClick={() => setSelected(new Set())} className="ms-auto inline-flex items-center gap-1 text-xs text-ivory/70 hover:text-ivory"><X className="size-3.5" /> {tr("Clear", "ניקוי")}</button>
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title={guests.length ? tr("No guests match", "לא נמצאו אורחים") : tr("Your guest list is empty", "רשימת האורחים ריקה")}
            body={guests.length ? tr("Try a different search or clear the filters.", "נסו חיפוש אחר או נקו את הסינון.") : tr("Add guests one by one, or import a spreadsheet.", "הוסיפו אורחים אחד־אחד, או ייבאו קובץ.")}
            action={guests.length ? <Button variant="outline" size="sm" onClick={() => { setQuery(""); setCategory(""); setGroup(""); setTab("all"); }}>{tr("Clear filters", "ניקוי הסינון")}</Button> : <Button size="sm" onClick={() => setForm({ open: true, guest: null })}>{tr("Add guest", "הוספת אורח")}</Button>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] text-sm">
                <caption className="sr-only">{tr("Guest list", "רשימת האורחים")}</caption>
                <thead className="border-b border-line bg-cream/50 text-xs text-stone">
                  <tr>
                    <th scope="col" className="w-10 ps-5"><Checkbox aria-label={tr("Select all on this page", "בחירת כל האורחים בעמוד")} checked={allVisible} indeterminate={!allVisible && someVisible} onChange={toggleVisible} /></th>
                    <SortHead k="name">{tr("Guest name", "שם האורח")}</SortHead>
                    <Th>{tr("Phone", "טלפון")}</Th>
                    <Th>{tr("Group / family", "קבוצה / משפחה")}</Th>
                    <SortHead k="attendees">{tr("Attendees", "מגיעים")}</SortHead>
                    <Th>{tr("RSVP status", "סטטוס")}</Th>
                    <Th>{tr("Dietary", "תזונה")}</Th>
                    <SortHead k="sent">{tr("Invitation sent", "נשלחה")}</SortHead>
                    <SortHead k="response">{tr("Last response", "תשובה אחרונה")}</SortHead>
                    <Th className="pe-5 text-end"><span className="sr-only">{tr("Actions", "פעולות")}</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((g) => (
                    <tr key={g.id} className={cn("border-b border-line/70 transition-colors duration-700 last:border-0 hover:bg-cream/40", selected.has(g.id) && "bg-champagne/25", liveIds.has(g.id) && "bg-confirmed-soft/70")}>
                      <td className="ps-5"><Checkbox aria-label={tr(`Select ${g.name}`, `בחירת ${guestDisplayName(g, locale)}`)} checked={selected.has(g.id)} onChange={() => toggle(g.id)} /></td>
                      <td className="px-3 py-2.5">
                        <button type="button" onClick={() => setDetailId(g.id)} className="flex items-center gap-2.5 text-start">
                          <Avatar name={g.name} className="size-8 text-[10px]" />
                          <span className="whitespace-nowrap font-medium text-ink underline-offset-4 hover:underline">{guestDisplayName(g, locale)}</span>
                        </button>
                      </td>
                      <td className="tabular whitespace-nowrap px-3 text-stone" dir="ltr">{formatPhone(g.phone) || "—"}</td>
                      <td className="max-w-48 truncate px-3 text-ink-soft">{(locale === "he" && g.groupHe) || g.group || "—"}</td>
                      <td className="tabular px-3">
                        <span className="font-medium">{g.status === "confirmed" ? g.attendees : "—"}</span>
                        <span className="text-mist"> / {maxParty(g)}</span>
                      </td>
                      <td className="px-3"><StatusBadge status={g.status} /></td>
                      <td className="max-w-40 truncate px-3 text-xs text-stone">{dietarySummary(g, locale) || "—"}</td>
                      <td className="whitespace-nowrap px-3 text-stone">{formatDateTime(g.invitationSentAt, locale)}</td>
                      <td className="whitespace-nowrap px-3 text-stone">{formatDateTime(g.lastResponseAt, locale)}</td>
                      <td className="sticky end-0 bg-gradient-to-l from-white via-white to-transparent pe-3 ps-4 text-end rtl:bg-gradient-to-r">
                        <div className="flex items-center justify-end">
                          <IconButton size="sm" label={tr(`WhatsApp ${g.name}`, `וואטסאפ ל${guestDisplayName(g, locale)}`)} disabled={!g.phone} onClick={() => void message(g)}><MessageCircle className="size-4" /></IconButton>
                          {rowActions(g)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {visible.map((g) => (
                <li key={g.id} className={cn("flex items-center gap-3 px-3 py-3", liveIds.has(g.id) && "bg-confirmed-soft/70")}>
                  <Checkbox aria-label={tr(`Select ${g.name}`, `בחירת ${guestDisplayName(g, locale)}`)} checked={selected.has(g.id)} onChange={() => toggle(g.id)} />
                  <button type="button" onClick={() => setDetailId(g.id)} className="min-w-0 flex-1 text-start">
                    <p className="truncate text-sm font-medium">{guestDisplayName(g, locale)}</p>
                    <p className="truncate text-xs text-stone">
                      <span dir="ltr">{formatPhone(g.phone)}</span> · {(locale === "he" && g.groupHe) || g.group}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <StatusBadge status={g.status} />
                      <span className="tabular text-xs text-stone">{g.status === "confirmed" ? g.attendees : "—"} / {maxParty(g)}</span>
                    </div>
                  </button>
                  {rowActions(g)}
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-3 text-sm sm:px-5">
              <p className="tabular text-xs text-stone">{tr(`${current * PAGE_SIZE + 1}–${Math.min(filtered.length, (current + 1) * PAGE_SIZE)} of ${filtered.length}`, `${current * PAGE_SIZE + 1}–${Math.min(filtered.length, (current + 1) * PAGE_SIZE)} מתוך ${filtered.length}`)}</p>
              <div className="flex items-center gap-1">
                <IconButton size="sm" label={tr("Previous page", "העמוד הקודם")} disabled={current === 0} onClick={() => setPage(current - 1)}><Prev className="size-4" /></IconButton>
                <span className="tabular px-2 text-xs text-stone">{current + 1} / {pages}</span>
                <IconButton size="sm" label={tr("Next page", "העמוד הבא")} disabled={current >= pages - 1} onClick={() => setPage(current + 1)}><Next className="size-4" /></IconButton>
              </div>
            </div>
          </>
        )}
      </Card>

      <GuestFormModal open={form.open} guest={form.guest} weddingId={wedding.id} groups={groups} onClose={() => setForm((f) => ({ ...f, open: false }))} onSave={async (g) => { await saveGuests([g]); toast(form.guest ? tr("Guest updated", "פרטי האורח עודכנו") : tr("Guest added", "האורח נוסף")); }} />
      <GuestDrawer guest={detail} wedding={wedding} onClose={() => setDetailId(null)} onEdit={(g) => { setDetailId(null); setForm({ open: true, guest: g }); }} onReminder={(g) => void message(g)} />
      <ImportModal open={importing} onClose={() => setImporting(false)} weddingId={wedding.id} existing={guests} onImport={saveGuests} />
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        size="sm"
        title={tr(`Delete ${confirmDelete?.length ?? 0} guest${(confirmDelete?.length ?? 0) > 1 ? "s" : ""}?`, `למחוק ${confirmDelete?.length ?? 0} אורחים?`)}
        description={tr("Their RSVP and personal link will be removed. This cannot be undone.", "אישור ההגעה והקישור האישי שלהם יימחקו. אי אפשר לבטל את הפעולה.")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>{tr("Cancel", "ביטול")}</Button>
            <Button variant="danger" onClick={async () => { const ids = confirmDelete ?? []; setConfirmDelete(null); await removeGuests(ids); setSelected((s) => { const n = new Set(s); ids.forEach((id) => n.delete(id)); return n; }); toast(tr("Deleted", "נמחק")); }}>{tr("Delete", "מחיקה")}</Button>
          </>
        }
      >
        <span />
      </Modal>
    </>
  );
}
