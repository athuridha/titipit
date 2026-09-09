"use client";

import { useEffect } from "react";
import { Warning, X } from "@phosphor-icons/react/dist/ssr";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  busy?: boolean;
  onConfirmAction?: () => void;
  onCancelAction?: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger",
  busy = false,
  onConfirmAction,
  onCancelAction,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open && !busy) {
        onCancelAction?.();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, busy, onCancelAction]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="relative z-[9999]"
    >
      {/* Backdrop */}
      <div
        onClick={() => !busy && onCancelAction?.()}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Box */}
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <div className="w-full max-w-md scale-100 rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 transition-all animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                variant === "danger"
                  ? "bg-red-50 text-red-600 ring-8 ring-red-50/50"
                  : variant === "warning"
                    ? "bg-amber-50 text-amber-600 ring-8 ring-amber-50/50"
                    : "bg-blue-50 text-blue-600 ring-8 ring-blue-50/50"
              }`}
            >
              <Warning size={22} weight="fill" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 id="confirm-dialog-title" className="text-base font-semibold text-slate-900">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={() => onCancelAction?.()}
                  disabled={busy}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => onCancelAction?.()}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onConfirmAction?.()}
              className={`inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition shadow-sm disabled:opacity-60 ${
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-500 shadow-red-600/20"
                  : variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
              }`}
            >
              {busy ? "Memproses..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
