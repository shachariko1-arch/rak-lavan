import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/templates", "/create", "/login", "/privacy", "/accessibility"].flatMap((path) =>
    (["en", "he"] as const).map((lang) => ({
      url: `${SITE.url}/${lang}${path}`,
      alternates: { languages: { en: `${SITE.url}/en${path}`, he: `${SITE.url}/he${path}` } },
    })),
  );
}
