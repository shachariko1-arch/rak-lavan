"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import type { PagesDict } from "@/lib/i18n/dictionaries/pages";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(5).max(4000),
  website: z.string().max(0).optional(), // honeypot
});
type Values = z.infer<typeof schema>;

export function ContactForm({ t }: { t: PagesDict["contact"] }) {
  const [state, setState] = useState<"idle" | "ok" | "error" | "rate">("idle");
  const form = useForm<Values>({ resolver: zodResolver(schema) as never });
  const onSubmit = form.handleSubmit(async (v) => {
    setState("idle");
    const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) }).catch(() => null);
    if (res?.ok) {
      setState("ok");
      form.reset();
    } else setState(res?.status === 429 ? "rate" : "error");
  });
  const input = "w-full rounded-[12px] border border-white/12 bg-white/[.03] px-4 py-3.5 text-[15px] text-pearl outline-none transition placeholder:text-smoke focus:border-champagne/70";
  const err = (k: keyof Values) => form.formState.errors[k] && <p className="mt-1.5 text-[12.5px] text-declined">{k === "email" ? t.invalidEmail : t.required}</p>;

  if (state === "ok")
    return (
      <div className="glass rounded-[24px] p-10 text-center" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-champagne" strokeWidth={1.3} />
        <p className="mt-5 font-display text-[26px] text-pearl">{t.success}</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="glass space-y-5 rounded-[24px] p-6 sm:p-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="mb-2 block text-[13px] text-mist" htmlFor="c-name">{t.name}</label><input id="c-name" className={input} autoComplete="name" {...form.register("name")} />{err("name")}</div>
        <div><label className="mb-2 block text-[13px] text-mist" htmlFor="c-email">{t.email}</label><input id="c-email" type="email" dir="ltr" className={input} autoComplete="email" {...form.register("email")} />{err("email")}</div>
      </div>
      <div><label className="mb-2 block text-[13px] text-mist" htmlFor="c-subj">{t.subject}</label><input id="c-subj" className={input} {...form.register("subject")} /></div>
      <div><label className="mb-2 block text-[13px] text-mist" htmlFor="c-msg">{t.message}</label><textarea id="c-msg" rows={6} className={`${input} resize-none`} dir="auto" {...form.register("message")} />{err("message")}</div>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...form.register("website")} />
      {(state === "error" || state === "rate") && <p role="alert" className="text-[14px] text-declined">{state === "rate" ? t.rateLimited : t.error}</p>}
      <Button type="submit" size="lg" loading={form.formState.isSubmitting} className="w-full sm:w-auto">{form.formState.isSubmitting ? t.sending : t.send}</Button>
    </form>
  );
}
