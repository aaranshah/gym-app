"use client";
import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent-hover shadow-sm disabled:opacity-60 disabled:hover:bg-accent",
  secondary:
    "bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface-2 shadow-sm disabled:opacity-50",
  ghost: "text-ink-2 hover:text-ink hover:bg-sunken disabled:opacity-40 disabled:hover:bg-transparent",
  danger: "text-danger hover:bg-danger-soft",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }
>(function Button({ variant = "secondary", size = "md", className, ...props }, ref) {
  const sizes = {
    sm: "h-8 px-2.5 text-[13px] gap-1.5 rounded-[8px]",
    md: "h-9 px-3 text-sm gap-2 rounded-[9px]",
    lg: "h-11 px-5 text-[15px] gap-2 rounded-[11px] font-medium",
  };
  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        "inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors disabled:cursor-not-allowed",
        sizes[size],
        VARIANT[variant],
        className,
      )}
      {...props}
    />
  );
});

export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }
>(function IconButton({ label, active, className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-muted transition-colors hover:bg-sunken hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent",
        active && "bg-sunken text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[10px] bg-sunken p-0.5">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={o.hint}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const i = options.findIndex((x) => x.value === value);
              const next = options[(i + (e.key === "ArrowRight" ? 1 : options.length - 1)) % options.length];
              onChange(next.value);
              (e.currentTarget.parentElement?.querySelector(`[data-v="${next.value}"]`) as HTMLElement | null)?.focus();
            }}
            data-v={o.value}
            tabIndex={selected ? 0 : -1}
            className={cx(
              "rounded-[8px] font-medium transition-all",
              size === "sm" ? "h-7 px-2.5 text-[13px]" : "h-8 px-3 text-[13.5px]",
              selected ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  hideLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  className?: string;
  hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "text-[12px] font-medium text-muted"}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-9 w-full appearance-none rounded-[9px] border border-line bg-surface pl-3 pr-8 text-[13.5px] text-ink shadow-sm transition-colors hover:border-line-strong"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[13.5px] font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-line-strong",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx("h-4 w-4 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-[4px] border border-current/25 px-1 font-sans text-[11px] leading-[16px] opacity-80">
      {children}
    </kbd>
  );
}
