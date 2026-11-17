import type { Metadata } from "next";
import { AccessibilityPage } from "@/components/site/pages";

export const metadata: Metadata = { title: "Accessibility statement" };

export default function Page() {
  return <AccessibilityPage />;
}
