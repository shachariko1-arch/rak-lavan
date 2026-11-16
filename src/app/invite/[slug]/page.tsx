import { Suspense } from "react";
import { InviteLoader } from "@/components/invitation/invite-loader";

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-ivory" />}>
      <InviteLoader />
    </Suspense>
  );
}
