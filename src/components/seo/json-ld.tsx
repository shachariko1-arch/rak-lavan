import { siteUrl } from "@/lib/site";

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VOW",
    url: siteUrl(),
    logo: `${siteUrl()}/brand/vow-app-icon-512.png`,
    slogan: "Your Story. Your Day. Your Invitation.",
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function productLd(plans: { name: string; price: number }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "VOW wedding invitation packages",
    brand: { "@type": "Brand", name: "VOW" },
    offers: plans.map((p) => ({ "@type": "Offer", name: p.name, price: p.price, priceCurrency: "ILS", url: `${siteUrl()}/pricing` })),
  };
}
