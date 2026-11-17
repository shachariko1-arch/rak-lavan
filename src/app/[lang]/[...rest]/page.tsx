import { notFound } from "next/navigation";

export function generateStaticParams() {
  return [{ rest: ["404"] }];
}

/** Any unknown path under a locale renders the localised 404. */
export default function CatchAll() {
  notFound();
}
