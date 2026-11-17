import type { Metadata } from "next";

/** Shared metadata builder for public pages (canonical + OG). */
export function pageMeta(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · VOW`, description, url: path },
  };
}
