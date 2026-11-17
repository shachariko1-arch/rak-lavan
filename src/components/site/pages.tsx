"use client";

import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { SiteFooter, SiteHeader } from "./chrome";
import { TemplateGallery } from "./gallery";

export function TemplatesPage() {
  const { tr } = useI18n();
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[1240px] px-5 pb-24 pt-32 sm:px-8">
        <p className="eyebrow">{tr("The collection", "הקולקציה")}</p>
        <h1 className="display mt-4 max-w-3xl text-6xl sm:text-7xl he:text-5xl sm:he:text-6xl">{tr("Invitations with a point of view", "הזמנות עם אמירה")}</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone">{tr("Six designs, each fully animated and available in Hebrew and English. Open one to try its palettes.", "שישה עיצובים, כולם מונפשים וזמינים בעברית ובאנגלית. פתחו אחד כדי לנסות את הפלטות שלו.")}</p>
        <div className="mt-16"><TemplateGallery /></div>
      </main>
      <SiteFooter />
    </>
  );
}

function Prose({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-5 pb-24 pt-32 sm:px-8">
        <h1 className="display text-5xl he:text-4xl">{title}</h1>
        <div className="mt-8 space-y-5 leading-relaxed text-ink-soft [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink [&_li]:ms-5 [&_li]:list-disc">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

const contact = SITE.supportEmail || "[contact e-mail to be added]";

export function PrivacyPage() {
  const { tr } = useI18n();
  return (
    <Prose title={tr("Privacy policy", "מדיניות פרטיות")}>
      <p className="rounded-2xl bg-pending-soft px-4 py-3 text-sm text-pending-ink">{tr("Draft. Have this reviewed by a lawyer and complete the operator details before launch.", "טיוטה. יש להעביר לבדיקת עורך דין ולהשלים את פרטי המפעיל לפני ההשקה.")}</p>
      <h2>{tr("What we store", "מה אנחנו שומרים")}</h2>
      <ul>
        <li>{tr("Couples: e-mail address, wedding details, wording, photos you upload.", "זוגות: כתובת אימייל, פרטי החתונה, נוסח ההזמנה ותמונות שהעליתם.")}</li>
        <li>{tr("Guests: name, phone number, RSVP, party names, dietary choices and any message they write.", "אורחים: שם, מספר טלפון, אישור הגעה, שמות המגיעים, העדפות תזונה והודעה שכתבו.")}</li>
      </ul>
      <h2>{tr("Who can see it", "מי רואה את המידע")}</h2>
      <p>{tr("Guest lists are visible only to the couple who own the wedding. A guest sees only their own reply, through their personal link. Invitation pages are not indexed by search engines.", "רשימת האורחים גלויה רק לזוג שהחתונה שלו. אורח רואה רק את התשובה שלו, דרך הקישור האישי. עמודי ההזמנה אינם נסרקים על ידי מנועי חיפוש.")}</p>
      <h2>{tr("AI", "בינה מלאכותית")}</h2>
      <p>{tr("When AI writing is enabled, the names, date, venue, style and personal note you type in the wizard are sent to our AI provider to compose the invitation. Photos and guest data are never sent.", "כשכתיבה בעזרת AI פעילה, השמות, התאריך, המקום, הסגנון וההערה האישית שהקלדתם באשף נשלחים לספק הבינה המלאכותית שלנו לצורך ניסוח ההזמנה. תמונות ונתוני אורחים אינם נשלחים לעולם.")}</p>
      <h2>{tr("Your choices", "הזכויות שלכם")}</h2>
      <p>{tr("You can export or delete your guest list at any time from the dashboard. To delete an account or ask a question, write to", "אפשר לייצא או למחוק את רשימת האורחים בכל רגע מלוח הבקרה. למחיקת חשבון או לשאלות, כתבו אל")} <span dir="ltr">{contact}</span>.</p>
    </Prose>
  );
}

export function AccessibilityPage() {
  const { tr } = useI18n();
  return (
    <Prose title={tr("Accessibility statement", "הצהרת נגישות")}>
      <p className="rounded-2xl bg-pending-soft px-4 py-3 text-sm text-pending-ink">{tr("Draft. Add the accessibility coordinator's name and contact details before launch.", "טיוטה. יש להוסיף את שם רכז/ת הנגישות ופרטי הקשר לפני ההשקה.")}</p>
      <p>{tr("VOW aims to meet WCAG 2.0 level AA and Israeli Standard 5568.", "VOW שואפת לעמוד בהנחיות WCAG 2.0 ברמה AA ובתקן הישראלי 5568.")}</p>
      <h2>{tr("What we have done", "מה עשינו")}</h2>
      <ul>
        <li>{tr("Full keyboard navigation with a visible focus indicator and a skip link.", "ניווט מלא במקלדת, עם סימון פוקוס ברור וקישור דילוג לתוכן.")}</li>
        <li>{tr("Right-to-left Hebrew and left-to-right English, with correct language tags.", "עברית מימין לשמאל ואנגלית משמאל לימין, עם תיוג שפה נכון.")}</li>
        <li>{tr("Labels on every form field, and status shown with text and icons, not colour alone.", "תוויות לכל שדה בטופס, וסטטוסים שמוצגים בטקסט ובאייקון ולא בצבע בלבד.")}</li>
        <li>{tr("Animations are reduced when your device asks for reduced motion, and the envelope can be skipped.", "האנימציות מצטמצמות כשהמכשיר מוגדר להפחתת תנועה, ואפשר לדלג על פתיחת המעטפה.")}</li>
        <li>{tr("Charts have a table view.", "לתרשימים יש תצוגת טבלה.")}</li>
      </ul>
      <h2>{tr("Found a problem?", "נתקלתם בבעיה?")}</h2>
      <p>{tr("Tell us and we will fix it:", "ספרו לנו ונתקן:")} <span dir="ltr">{contact}</span></p>
    </Prose>
  );
}

export function NotFoundView() {
  const { tr, href } = useI18n();
  return (
    <main id="main" className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-4 text-6xl he:text-5xl">{tr("This page was never invited", "העמוד הזה לא הוזמן")}</h1>
      <p className="mt-4 text-stone">{tr("The link may be mistyped, or the page has moved.", "ייתכן שהקישור שגוי, או שהעמוד עבר למקום אחר.")}</p>
      <ButtonLink href={href("/")} className="mt-8">{tr("Back to the start", "חזרה לעמוד הבית")}</ButtonLink>
    </main>
  );
}
