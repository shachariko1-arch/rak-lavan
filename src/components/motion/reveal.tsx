"use client";

import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, animate, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

// motion.create() must not run on every render, so components are cached per tag.
const motionCache = new Map<ElementType, ReturnType<typeof motion.create>>();
function motionFor(as: ElementType) {
  let comp = motionCache.get(as);
  if (!comp) {
    comp = motion.create(as);
    motionCache.set(as, comp);
  }
  return comp as typeof motion.div;
}

/** Fade + rise when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: ElementType;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const Comp = motionFor(as);
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0.3 : 0.9, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function Stagger({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: ElementType }) {
  const Comp = motionFor(as);
  return (
    <Comp className={className} variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: ElementType }) {
  const Comp = motionFor(as);
  return (
    <Comp className={className} variants={staggerChild}>
      {children}
    </Comp>
  );
}

/** Reveals each line from behind a mask, one after another. */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  as = "h2",
  immediate = false,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: ElementType;
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  const Comp = as;
  const props = immediate ? { initial: "hidden", animate: "show" } : { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <Comp className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={cn("block", lineClassName)}
            variants={{
              hidden: { y: reduce ? 0 : "105%", opacity: reduce ? 0 : 1 },
              show: { y: "0%", opacity: 1, transition: { duration: reduce ? 0.3 : 1.1, delay: delay + i * 0.14, ease: EASE } },
            }}
            {...props}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}

/** Counts up to `value` when visible. */
export function CountUp({
  value,
  className,
  format = (n: number) => Math.round(n).toLocaleString(),
  duration = 1.6,
}: {
  value: number;
  className?: string;
  format?: (n: number) => string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(format(0));
  const last = useRef(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(format(value));
      last.current = value;
      return;
    }
    const controls = animate(last.current, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(format(v)),
    });
    last.current = value;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </span>
  );
}

/** Vertical parallax drift tied to scroll position. */
export function Parallax({ children, className, offset = 60 }: { children: ReactNode; className?: string; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [offset, -offset]), { stiffness: 80, damping: 20, mass: 0.4 });
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/** Draws an SVG line as the element scrolls through the viewport. */
export function useScrollDraw<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const pathLength = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  return { ref, pathLength };
}
