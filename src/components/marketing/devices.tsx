import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A realistic smartphone: metallic frame, black bezel, dynamic island and
 * glass reflections. Screen content is a live React tree, never a screenshot.
 */
export function SmartphoneMockup({
  children,
  className,
  finish = "champagne",
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  finish?: "champagne" | "graphite";
  glare?: boolean;
}) {
  const frame =
    finish === "champagne"
      ? "linear-gradient(145deg,#f6e6c8 0%,#c6a678 18%,#8d7150 34%,#e7cfa6 52%,#a8885f 70%,#f1ddb9 86%,#9b7c55 100%)"
      : "linear-gradient(145deg,#6b6d73 0%,#2b2c31 25%,#4c4e55 50%,#1c1d21 75%,#5d5f66 100%)";
  return (
    <div className={cn("relative aspect-[390/844] w-full", className)}>
      {/* side buttons */}
      <span className="absolute -start-[3px] top-[18%] h-[6%] w-[3px] rounded-s-sm" style={{ background: frame }} />
      <span className="absolute -start-[3px] top-[27%] h-[9%] w-[3px] rounded-s-sm" style={{ background: frame }} />
      <span className="absolute -end-[3px] top-[24%] h-[12%] w-[3px] rounded-e-sm" style={{ background: frame }} />
      <div
        className="absolute inset-0 rounded-[15.5%/7.2%] p-[2.4%] shadow-[0_60px_100px_-40px_rgba(0,0,0,.85),0_30px_60px_-30px_rgba(0,0,0,.6),inset_0_0_0_1px_rgba(255,255,255,.25)]"
        style={{ background: frame }}
      >
        <div className="relative h-full w-full rounded-[13.5%/6.3%] bg-black p-[2%]">
          <div className="relative h-full w-full overflow-hidden rounded-[12%/5.6%] bg-night">
            {children}
            {/* dynamic island */}
            <div className="pointer-events-none absolute left-1/2 top-[1.6%] z-30 h-[3.6%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
            {glare && (
              <div
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.04) 28%, transparent 42%, transparent 70%, rgba(255,255,255,.05) 100%)",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A printed invitation card floating in space, with paper depth and soft shadow. */
export function PaperCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] shadow-[0_50px_90px_-40px_rgba(0,0,0,.9),0_20px_40px_-25px_rgba(0,0,0,.6)] ring-1 ring-white/10",
        className,
      )}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,.22),transparent_40%)] mix-blend-soft-light" />
    </div>
  );
}
