import type { Metadata } from "next";
import { TemplatesPage } from "@/components/site/pages";

export const metadata: Metadata = { title: "Invitation designs" };

export default function Page() {
  return <TemplatesPage />;
}
