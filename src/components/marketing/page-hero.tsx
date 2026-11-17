import { Container, SectionHeading } from "./section";

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <section className="relative overflow-hidden pb-6 pt-40 sm:pt-48">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_0%,rgba(217,185,139,.14),transparent_60%),radial-gradient(50%_50%_at_0%_20%,rgba(36,50,74,.5),transparent_70%)]" />
      <div className="grain absolute inset-0" />
      <Container className="relative">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} />
      </Container>
    </section>
  );
}
