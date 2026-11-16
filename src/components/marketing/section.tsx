import type { ReactNode } from "react";
import { RevealLines, Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-4 sm:px-8", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  className,
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <Reveal y={12}>
          <p className={cn("eyebrow mb-5 flex items-center gap-3 text-champagne", align === "center" && "justify-center")}>
            <span className="h-px w-8 bg-champagne/60" aria-hidden />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <RevealLines as={as} lines={[title]} className="font-display text-display text-pearl text-balance" />
      {description && (
        <Reveal delay={0.15}>
          <p className={cn("mt-6 max-w-xl text-[16px] leading-relaxed text-mist sm:text-[17px]", align === "center" && "mx-auto")}>{description}</p>
        </Reveal>
      )}
    </div>
  );
}
