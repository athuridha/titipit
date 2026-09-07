import type { ReactNode } from "react";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["mx-auto w-full max-w-[1320px] px-5 md:px-8", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

/** Small uppercase label above a headline. Rationed: max one per three sections. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-text">
      {children}
    </p>
  );
}
