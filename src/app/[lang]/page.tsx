import { Landing } from "@/components/site/landing";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VOW",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  description: "AI wedding invitations, animated digital invitations, RSVP management and a real-time guest dashboard.",
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Landing />
    </>
  );
}
