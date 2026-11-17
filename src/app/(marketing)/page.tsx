import { HeroSection } from "@/components/marketing/hero";
import { HowItWorks, TemplateGallery, ValueStrip } from "@/components/marketing/home-sections-a";
import { GuestManagementShowcase, InvitationExperienceDemo, WhatsAppShowcase } from "@/components/marketing/home-sections-b";
import { FAQ, Features, FinalCTA, Pricing, Testimonials } from "@/components/marketing/home-sections-c";
import { JsonLd, organizationLd } from "@/components/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationLd()} />
      <HeroSection />
      <ValueStrip />
      <HowItWorks />
      <TemplateGallery />
      <InvitationExperienceDemo />
      <GuestManagementShowcase />
      <WhatsAppShowcase />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
