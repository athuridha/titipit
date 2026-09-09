"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WhatsappLogo, X } from "@phosphor-icons/react/dist/ssr";

type WaContact = { label: string; number: string };

function toWaNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

export function WhatsappButton({
  message = "Halo titip.it, saya ingin konsultasi kebutuhan IT saya.",
  className,
  children,
}: {
  message?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState<WaContact[] | null>(null);

  useEffect(() => {
    if (open && !contacts) {
      fetch("/api/contact")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.numbers) setContacts(data.numbers);
        })
        .catch(() => {});
    }
  }, [open, contacts]);

  useEffect(() => {
    if (open) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [open]);

  function handleOpen() {
    if (contacts && contacts.length === 1) {
      const url = `https://wa.me/${toWaNumber(contacts[0].number)}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button type="button" onClick={handleOpen} className={className}>
        {children ?? (
          <>
            <WhatsappLogo size={18} weight="bold" className="text-accent-text" aria-hidden />
            Konsultasi WhatsApp gratis
          </>
        )}
      </button>

      <AnimatePresence>
        {open && contacts && contacts.length > 0 ? (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Pilih admin WhatsApp"
              className="fixed left-1/2 top-1/2 z-[90] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center justify-between p-5 pb-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Chat WhatsApp</h2>
                  <p className="mt-0.5 text-sm text-muted">Pilih admin yang ingin kamu hubungi</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup"
                  className="grid size-9 place-items-center rounded-pill text-muted transition hover:bg-surface-2 hover:text-ink"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
              <ul className="px-3 pb-4">
                {contacts.map((c) => (
                  <li key={`${c.label}-${c.number}`}>
                    <a
                      href={`https://wa.me/${toWaNumber(c.number)}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3.5 rounded-xl px-3 py-3.5 transition hover:bg-accent-soft"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-pill bg-emerald-500/15 text-emerald-600">
                        <WhatsappLogo size={22} weight="fill" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink">{c.label}</span>
                        <span className="block font-mono text-xs text-muted">{c.number}</span>
                      </span>
                      <span className="shrink-0 rounded-pill bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white">
                        Chat
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
