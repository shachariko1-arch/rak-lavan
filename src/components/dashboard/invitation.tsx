"use client";

import { Copy, ExternalLink, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { DetailsFields, LivePreview, PhotosField, TemplatePicker, WordingFields } from "@/components/studio/editor";
import { Button } from "@/components/ui/button";
import { Field, Input, Segmented, Switch } from "@/components/ui/form";
import { Card, Tabs } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { currentOrigin, inviteUrl } from "@/lib/site";
import type { Locale, Wedding } from "@/lib/types";
import { copyText } from "@/lib/utils";
import { useDashboard } from "./context";
import { PageHeader } from "./shell";

type Section = "design" | "wording" | "details" | "photos" | "settings";

export function InvitationPage() {
  const { tr, locale } = useI18n();
  const { wedding, saveWedding } = useDashboard();
  const { toast } = useToast();
  const [draft, setDraft] = useState<Wedding | null>(wedding);
  const [section, setSection] = useState<Section>("design");
  const [preview, setPreview] = useState<Locale>(locale);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(wedding), [wedding?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!wedding || !draft) return null;

  const dirty = JSON.stringify(draft) !== JSON.stringify(wedding);
  const patch = (p: Partial<Wedding>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const link = inviteUrl(currentOrigin(), wedding.slug);

  const save = async () => {
    setSaving(true);
    try {
      await saveWedding(draft);
      toast(tr("Invitation updated", "ההזמנה עודכנה"), { description: tr("Guests see the changes immediately.", "האורחים רואים את השינויים מיד.") });
    } catch {
      toast(tr("Could not save. Your browser storage may be full.", "השמירה נכשלה. ייתכן שאחסון הדפדפן מלא."), { tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={tr("Your invitation", "ההזמנה שלכם")}
        title={tr("Design & wording", "עיצוב וניסוח")}
        actions={
          <>
            <a href={`/invite/${wedding.slug}?lang=${preview}`} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/15 bg-white/60 px-3.5 text-[13px] font-medium hover:bg-white"><ExternalLink className="size-3.5" /> {tr("Open", "פתיחה")}</a>
            <Button size="sm" icon={<Save className="size-3.5" />} disabled={!dirty} loading={saving} onClick={() => void save()}>{tr("Save changes", "שמירת שינויים")}</Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="min-w-0 p-4 sm:p-7">
          <Tabs<Section> label={tr("Invitation sections", "חלקי ההזמנה")} value={section} onChange={setSection} tabs={[{ value: "design", label: tr("Design", "עיצוב") }, { value: "wording", label: tr("Wording", "ניסוח") }, { value: "details", label: tr("Details", "פרטים") }, { value: "photos", label: tr("Photos", "תמונות") }, { value: "settings", label: tr("Link & RSVP", "קישור ואישורים") }]} />
          <div className="pt-6">
            {section === "design" ? <TemplatePicker wedding={draft} patch={patch} locale={preview} /> : null}
            {section === "wording" ? (
              <>
                <div className="mb-4"><Segmented label={tr("Language", "שפה")} value={preview} onChange={setPreview} options={[{ value: "en", label: "English" }, { value: "he", label: "עברית" }]} /></div>
                <WordingFields wedding={draft} patch={patch} locale={preview} />
              </>
            ) : null}
            {section === "details" ? <DetailsFields wedding={draft} patch={patch} locale={preview} /> : null}
            {section === "photos" ? <PhotosField wedding={draft} patch={patch} /> : null}
            {section === "settings" ? (
              <div className="space-y-6">
                <div>
                  <p className="text-[13px] font-medium text-ink-soft">{tr("Public invitation link", "קישור ההזמנה הציבורי")}</p>
                  <div className="mt-1.5 flex gap-2">
                    <Input readOnly value={link} dir="ltr" aria-label={tr("Invitation link", "קישור ההזמנה")} onFocus={(e) => e.currentTarget.select()} />
                    <Button variant="outline" icon={<Copy className="size-4" />} onClick={async () => (await copyText(link)) && toast(tr("Link copied", "הקישור הועתק"))}>{tr("Copy", "העתקה")}</Button>
                  </div>
                  <p className="mt-1.5 text-xs text-stone">{tr("Each guest also has a personal link, found in the guest list.", "לכל אורח יש גם קישור אישי, שנמצא ברשימת האורחים.")}</p>
                </div>
                <Field label={tr("Reply-by date", "מועד אחרון לתשובה")} optional={tr("Optional", "לא חובה")}>{(f) => <Input id={f.id} type="date" className="max-w-56" value={draft.rsvpDeadline ?? ""} onChange={(e) => patch({ rsvpDeadline: e.target.value || null })} />}</Field>
                <Segmented label={tr("Invitation language", "שפת ההזמנה")} value={draft.language} onChange={(language) => patch({ language })} options={[{ value: "en", label: tr("Opens in English", "נפתחת באנגלית") }, { value: "he", label: tr("Opens in Hebrew", "נפתחת בעברית") }]} />
                <Switch checked={draft.allowOpenRsvp} onChange={(allowOpenRsvp) => patch({ allowOpenRsvp })} label={tr("Allow replies from the public link", "לאפשר אישור הגעה מהקישור הציבורי")} description={tr("People without a personal link can reply with their name and phone number. Turn off to accept replies only from guests on your list.", "מי שאין לו קישור אישי יוכל לאשר הגעה עם שם וטלפון. כבו כדי לקבל תשובות רק מאורחים שברשימה.")} />
              </div>
            ) : null}
          </div>
        </Card>
        <div className="lg:sticky lg:top-8 lg:self-start">
          <LivePreview wedding={draft} locale={preview} onLocale={setPreview} />
        </div>
      </div>
    </>
  );
}
