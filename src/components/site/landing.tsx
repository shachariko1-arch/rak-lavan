"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ChartColumn, Link2, MessageCircle, Radio, Sparkles, Users, Utensils, WandSparkles } from "lucide-react";
import { useRef } from "react";
import { InvitationCard } from "@/components/invitation/card";
import { Particles } from "@/components/invitation/particles";
import { ButtonLink } from "@/components/ui/button";
import { AnimatedNumber, Reveal, StatusBadge } from "@/components/ui/misc";
import { buildDemoWedding } from "@/lib/data/demo-seed";
import { useI18n } from "@/lib/i18n";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import { SiteFooter, SiteHeader } from "./chrome";
import { TemplateGallery } from "./gallery";

const sample = buildDemoWedding(0);
const EASE = [0.22, 1, 0.36, 1] as const;

function Headline({ lines }: { lines: string[] }) {
  return (
    <h1 className="display text-balance text-[13.5vw] text-white sm:text-7xl lg:text-[5.4rem] he:text-[11.5vw] sm:he:text-6xl lg:he:text-7xl">
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.25 + i * 0.16, ease: EASE }}>
            {i === lines.length - 1 ? <span className="gold-text italic he:not-italic">{line}</span> : line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

/** The invitation floating over the hero. It tilts towards the pointer. */
function FloatingCard() {
  const { locale } = useI18n();
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  return (
    <motion.div
      className="relative mx-auto w-[min(68vw,340px)]"
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, delay: 0.7, ease: EASE }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 16);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
        <div className="animate-float-slow" style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0 translate-x-[9%] translate-y-[5%] rotate-[7deg] opacity-80" style={{ transform: "translateZ(-60px) translateX(9%) translateY(5%) rotate(7deg)" }}>
            <InvitationCard wedding={sample} locale={locale} templateId="royal" palette={getTemplate("royal").palettes[0]} />
          </div>
          <div className="relative rotate-[-3deg]">
            <InvitationCard wedding={sample} locale={locale} animated />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Landing() {
  const { tr, href, isRtl, locale } = useI18n();
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const steps = [
    { n: "01", title: tr("Tell us about your wedding", "ספרו לנו על החתונה"), body: tr("Names, date, venue and the feeling you are after. It takes two minutes.", "שמות, תאריך, מקום והתחושה שאתם מחפשים. שתי דקות, לא יותר.") },
    { n: "02", title: tr("Let AI create your invitation", "תנו לבינה המלאכותית ליצור את ההזמנה"), body: tr("Wording in Hebrew and English, matched designs and colour palettes, all editable.", "ניסוח בעברית ובאנגלית, עיצובים ופלטות צבעים מותאמים, והכול ניתן לעריכה.") },
    { n: "03", title: tr("Send it and manage your RSVPs", "שלחו לאורחים ונהלו את האישורים"), body: tr("Every guest gets a personal link on WhatsApp. Replies land in your dashboard as they happen.", "כל אורח מקבל קישור אישי בוואטסאפ. התשובות מגיעות ללוח הבקרה ברגע שהן נשלחות.") },
  ];

  const features = [
    { icon: WandSparkles, title: tr("AI invitation generator", "מחולל הזמנות חכם"), body: tr("Wording, introduction, design and palette suggestions written for the two of you.", "ניסוח, פתיח אישי, עיצוב ופלטת צבעים שנכתבים במיוחד בשבילכם.") },
    { icon: Sparkles, title: tr("Premium animated invitations", "הזמנות מונפשות ברמה אחרת"), body: tr("An envelope that opens, a card that rises, petals, gold dust and a live countdown.", "מעטפה שנפתחת, הזמנה שעולה ממנה, עלי כותרת, אבק זהב וספירה לאחור.") },
    { icon: Link2, title: tr("Personalised guest links", "קישור אישי לכל אורח"), body: tr("Each guest opens an invitation addressed to them, with their own party size.", "כל אורח פותח הזמנה שממוענת אליו, עם מספר המוזמנים שלו.") },
    { icon: MessageCircle, title: tr("WhatsApp sharing", "שיתוף בוואטסאפ"), body: tr("Personal messages and gentle reminders, sent from your own WhatsApp.", "הודעות אישיות ותזכורות עדינות, שנשלחות מהוואטסאפ שלכם.") },
    { icon: Radio, title: tr("Real-time RSVP tracking", "מעקב אישורים בזמן אמת"), body: tr("Watch the attendance counter move the moment someone replies.", "ראו את מונה המגיעים זז ברגע שמישהו עונה.") },
    { icon: Users, title: tr("Guest management dashboard", "לוח בקרה לניהול אורחים"), body: tr("Search, filter, import from Excel, edit in bulk and export for your venue.", "חיפוש, סינון, ייבוא מאקסל, עריכה מרוכזת וייצוא לאולם.") },
    { icon: Utensils, title: tr("Dietary preferences & seating", "העדפות תזונה והושבה"), body: tr("Meal choices per person and table numbers, ready for the caterer.", "בחירת מנה לכל אורח ומספרי שולחנות, מוכנים לקייטרינג.") },
    { icon: ChartColumn, title: tr("Analytics that answer questions", "נתונים שעונים על שאלות"), body: tr("Who replied, when, and how many from each side of the family.", "מי ענה, מתי, וכמה מגיעים מכל צד של המשפחה.") },
  ];

  return (
    <>
      <SiteHeader overHero />
      <main id="main">
        {/* Hero */}
        <section ref={hero} className="grain relative flex min-h-svh items-center overflow-hidden bg-ink pb-16 pt-24">
          <motion.div aria-hidden className="absolute inset-0" style={{ y: bgY }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo/scene-1.svg" alt="" className="size-full scale-125 animate-kenburns object-cover blur-2xl" />
          </motion.div>
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(21_18_15/0.72),rgb(21_18_15/0.42)_45%,rgb(21_18_15/0.9))]" />
          <Particles kind="gold" colors={["#e9d19c", "#fff3d6"]} />
          <motion.div style={{ opacity: fade }} className="relative mx-auto grid w-full max-w-[1240px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <motion.p className="eyebrow !text-gold-soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.1 }}>
                {tr("AI wedding invitations & guest management", "הזמנות חתונה חכמות וניהול אורחים")}
              </motion.p>
              <div className="mt-5">
                <Headline lines={locale === "he" ? ["הסיפור שלכם.", "היום שלכם.", "ההזמנה שלכם."] : ["Your Story.", "Your Day.", "Your Invitation."]} />
              </div>
              <motion.p className="mt-6 max-w-md text-lg leading-relaxed text-white/75" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.9 }}>
                {tr("An animated invitation your guests will remember, and a calm, real-time view of who is coming.", "הזמנה מונפשת שהאורחים יזכרו, ותמונה רגועה ועדכנית של מי מגיע.")}
              </motion.p>
              <motion.div className="mt-9 flex flex-wrap gap-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.1 }}>
                <ButtonLink href={href("/create")} variant="gold" size="lg" iconEnd={<Arrow className="size-4" />}>{tr("Create Your Invitation", "יצירת ההזמנה שלכם")}</ButtonLink>
                <ButtonLink href={href("/templates")} variant="light" size="lg">{tr("Explore Invitations", "לכל ההזמנות")}</ButtonLink>
              </motion.div>
            </div>
            <FloatingCard />
          </motion.div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-[1240px]">
            <Reveal className="max-w-2xl">
              <p className="eyebrow">{tr("How it works", "איך זה עובד")}</p>
              <h2 className="display mt-4 text-5xl sm:text-6xl he:text-4xl sm:he:text-5xl">{tr("From first idea to full dance floor", "מהרעיון הראשון ועד רחבה מלאה")}</h2>
            </Reveal>
            <ol className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-line bg-line md:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal as="li" key={s.n} delay={i * 0.12} className="group bg-ivory p-8 transition-colors duration-500 hover:bg-white sm:p-10">
                  <span className="font-serif text-6xl text-gold-soft transition-colors duration-500 group-hover:text-gold" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{s.n}</span>
                  <h3 className="mt-6 font-serif text-3xl leading-tight he:text-2xl">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-stone">{s.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Dashboard teaser */}
        <section className="bg-cream/60 px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <p className="eyebrow">{tr("For the two of you", "בשביל שניכם")}</p>
              <h2 className="display mt-4 text-5xl sm:text-6xl he:text-4xl sm:he:text-5xl">{tr("Know who is coming, the moment they decide", "דעו מי מגיע, ברגע שהם מחליטים")}</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-stone">{tr("No spreadsheets passed around the family. One private dashboard, always current.", "בלי קובצי אקסל שעוברים בין בני המשפחה. לוח בקרה פרטי אחד, תמיד מעודכן.")}</p>
              <ButtonLink href={href("/login")} className="mt-8" iconEnd={<Arrow className="size-4" />}>{tr("Open the live demo", "כניסה להדגמה חיה")}</ButtonLink>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="rounded-[2rem] border border-line bg-white p-6 shadow-lift sm:p-8">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold-deep he:tracking-normal"><span className="size-2 animate-pulse-dot rounded-full bg-confirmed" />{tr("Live attendance", "נוכחות בזמן אמת")}</p>
                <p className="mt-2 font-serif text-7xl leading-none"><AnimatedNumber value={441} /></p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  {([[218, "confirmed"], [42, "declined"], [90, "pending"]] as const).map(([n, status]) => (
                    <div key={status} className="rounded-2xl bg-cream/70 p-3">
                      <p className="font-serif text-3xl"><AnimatedNumber value={n} /></p>
                      <StatusBadge status={status} className="mt-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Features */}
        <section className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-[1240px]">
            <Reveal className="max-w-2xl">
              <p className="eyebrow">{tr("Everything in one place", "הכול במקום אחד")}</p>
              <h2 className="display mt-4 text-5xl sm:text-6xl he:text-4xl sm:he:text-5xl">{tr("Considered down to the last detail", "מחושב עד הפרט האחרון")}</h2>
            </Reveal>
            <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <Reveal as="li" key={f.title} delay={(i % 4) * 0.08}>
                  <f.icon aria-hidden className="size-6 text-gold-deep" strokeWidth={1.5} />
                  <h3 className="mt-4 font-serif text-2xl leading-tight he:text-xl">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-stone">{f.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* Templates */}
        <section className="bg-ink px-5 py-24 text-ivory sm:px-8 sm:py-32">
          <div className="mx-auto max-w-[1240px]">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="eyebrow !text-gold-soft">{tr("The collection", "הקולקציה")}</p>
                <h2 className="display mt-4 text-5xl sm:text-6xl he:text-4xl sm:he:text-5xl">{tr(`${TEMPLATES.length} designs, each with its own motion`, `${TEMPLATES.length} עיצובים, לכל אחד תנועה משלו`)}</h2>
              </div>
              <ButtonLink href={href("/templates")} variant="light">{tr("Explore Invitations", "לכל ההזמנות")}</ButtonLink>
            </Reveal>
            <div className="mt-14"><TemplateGallery dark /></div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative overflow-hidden px-5 py-28 text-center sm:py-40">
          <div aria-hidden className="absolute left-1/2 top-1/2 size-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/60 blur-3xl" />
          <Reveal className="relative mx-auto max-w-2xl">
            <h2 className="display text-6xl sm:text-7xl he:text-5xl sm:he:text-6xl">{tr("Begin with your names", "מתחילים מהשמות שלכם")}</h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-stone">{tr("Your invitation can be ready before the coffee gets cold.", "ההזמנה שלכם יכולה להיות מוכנה לפני שהקפה מתקרר.")}</p>
            <ButtonLink href={href("/create")} variant="gold" size="lg" className="mt-9" iconEnd={<Arrow className="size-4" />}>{tr("Create Your Invitation", "יצירת ההזמנה שלכם")}</ButtonLink>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
