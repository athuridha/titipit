"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { cta, navLinks } from "@/lib/site";

export function SiteNav() {
  return (
    <Suspense>
      <SiteNavInner />
    </Suspense>
  );
}

function SiteNavInner() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isAdmin = pathname?.startsWith("/admin");
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (isAdmin) return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line/80 bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] w-full max-w-[1320px] items-center justify-between gap-6 px-5 md:px-8">
          <Wordmark />

          <nav aria-label="Navigasi utama" className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={cta.track.href}
              className="hidden rounded-pill px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink lg:block"
            >
              {cta.track.label}
            </Link>
            <ButtonLink href={cta.order.href} className="hidden lg:inline-flex">
              {cta.order.label}
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Buka menu navigasi"
              className="grid size-10 place-items-center rounded-pill border border-line text-ink lg:hidden"
            >
              <List size={18} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer portaled to document.body to escape header backdrop-filter containing block */}
      {mounted && typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  className="fixed inset-0 z-[100] flex min-h-[100dvh] w-full flex-col bg-[var(--bg)] text-[var(--text)] overflow-y-auto lg:hidden"
                  initial={reduce ? false : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-line px-5">
                    <Wordmark />
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Tutup menu navigasi"
                        className="grid size-10 place-items-center rounded-pill border border-line text-ink transition-colors hover:border-accent-hairline"
                      >
                        <X size={18} weight="bold" />
                      </button>
                    </div>
                  </div>
                  <nav aria-label="Navigasi seluler" className="flex flex-1 flex-col justify-between px-5 py-6">
                    <div className="flex flex-col gap-1">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="border-b border-line py-4 text-xl font-medium tracking-tight text-ink transition-colors hover:text-accent-text"
                        >
                          {link.label}
                        </Link>
                      ))}
                      <Link
                        href={cta.track.href}
                        onClick={() => setOpen(false)}
                        className="border-b border-line py-4 text-xl font-medium tracking-tight text-ink transition-colors hover:text-accent-text"
                      >
                        {cta.track.label}
                      </Link>
                    </div>

                    <div className="mt-8 pt-4">
                      <ButtonLink
                        href={cta.order.href}
                        size="lg"
                        onClick={() => setOpen(false)}
                        className="w-full"
                      >
                        {cta.order.label}
                      </ButtonLink>
                    </div>
                  </nav>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
