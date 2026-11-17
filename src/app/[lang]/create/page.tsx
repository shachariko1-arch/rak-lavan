import type { Metadata } from "next";
import { Wizard } from "@/components/studio/wizard";

export const metadata: Metadata = { title: "Create your invitation" };

export default function Page() {
  return <Wizard />;
}
