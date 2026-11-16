"use client";

import { Check, ChevronDown } from "lucide-react";
import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-xl border border-line bg-white/80 text-ink placeholder:text-mist/80 shadow-[0_1px_0_rgb(21_18_15/0.02)] " +
  "transition-[border-color,box-shadow,background-color] duration-200 " +
  "hover:border-sand focus:border-gold focus:bg-white focus:outline-none focus:ring-4 focus:ring-gold/15 " +
  "disabled:cursor-not-allowed disabled:bg-cream/60 disabled:text-stone aria-[invalid=true]:border-declined aria-[invalid=true]:ring-declined/10";

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: string;
  className?: string;
  /** Render function receives the ids to wire label, hint and error to the control. */
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

/** Label + control + hint/error, wired together for assistive tech. */
export function Field({ label, hint, error, optional, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[13px] font-medium text-ink-soft">
        <span>{label}</span>
        {optional ? <span className="text-xs font-normal text-mist">{optional}</span> : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-declined">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-stone">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...rest }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(CONTROL, "h-11 px-3.5 text-[15px]", className)}
        {...rest}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, rows = 3, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL, "min-h-[5.5rem] resize-y px-3.5 py-2.5 text-[15px] leading-relaxed", className)}
      {...rest}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; compact?: boolean }
>(function Select({ className, invalid, compact, children, ...rest }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          CONTROL,
          "appearance-none pe-9 ps-3.5",
          compact ? "h-9 text-[13px]" : "h-11 text-[15px]",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-stone"
      />
    </div>
  );
});

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  indeterminate?: boolean;
}

export function Checkbox({ label, indeterminate, className, checked, ...rest }: CheckboxProps) {
  const box = (
    <span className="relative inline-flex size-[18px] shrink-0 items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = Boolean(indeterminate);
        }}
        className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-[5px] border border-sand bg-white transition-colors checked:border-ink checked:bg-ink indeterminate:border-ink indeterminate:bg-ink focus-visible:outline-offset-2"
        {...rest}
      />
      {indeterminate ? (
        <span aria-hidden className="pointer-events-none relative h-0.5 w-2.5 rounded bg-white" />
      ) : (
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none relative size-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        />
      )}
    </span>
  );
  if (!label) return <span className={cn("inline-flex", className)}>{box}</span>;
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft", className)}>
      {box}
      <span>{label}</span>
    </label>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {description ? <p className="mt-0.5 text-[13px] leading-snug text-stone">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-300 disabled:opacity-50",
          checked ? "bg-ink" : "bg-beige",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset-inline-start] duration-300 ease-luxe",
            checked ? "start-[22px]" : "start-0.5",
          )}
        />
      </button>
    </div>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
  size?: "sm" | "md";
  className?: string;
}

/** Compact exclusive choice, e.g. English | עברית. */
export function Segmented<T extends string>({ value, onChange, options, label, size = "md", className }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-full border border-line bg-cream/70 p-0.5", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full font-medium transition-all duration-300 ease-luxe",
              size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-[13px]",
              active ? "bg-white text-ink shadow-card" : "text-stone hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
}

/** Number input with large touch targets, for party sizes. */
export function Stepper({ value, onChange, min = 0, max = 99, label, decreaseLabel, increaseLabel }: StepperProps) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border border-line bg-white/80">
      <button
        type="button"
        aria-label={decreaseLabel}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex size-11 items-center justify-center rounded-full text-lg text-ink transition hover:bg-cream disabled:opacity-30"
      >
        −
      </button>
      <output aria-live="polite" className="tabular w-9 text-center text-base font-medium text-ink">
        {value}
      </output>
      <button
        type="button"
        aria-label={increaseLabel}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex size-11 items-center justify-center rounded-full text-lg text-ink transition hover:bg-cream disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
