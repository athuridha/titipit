"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  PaperPlaneTilt,
  ShieldCheck,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/wordmark";

type Props = {
  initialOrderCode?: string;
  initialName?: string;
  initialTitle?: string;
  initialServiceName?: string;
};

export function TestimonialForm({
  initialOrderCode,
  initialName = "",
  initialTitle,
  initialServiceName,
}: Props) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(initialName);
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [orderCode] = useState(initialOrderCode ?? "");
  const [consent, setConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!name.trim()) {
      setError("Nama kamu wajib diisi.");
      return;
    }
    if (!role.trim()) {
      setError("Peran, kampus, atau bisnis kamu wajib diisi.");
      return;
    }
    if (quote.trim().length < 10) {
      setError("Ulasan minimal 10 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim(),
          quote: quote.trim(),
          rating,
          orderCode: orderCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim ulasan.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-card border border-line bg-surface p-8 text-center shadow-[var(--shadow-card)] sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-pill bg-accent-soft text-accent-text">
          <CheckCircle size={36} weight="fill" />
        </span>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Terima kasih banyak, {name}!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Ulasan kamu telah tersimpan dengan aman dan membantu calon klien lain melihat transparansi serta kualitas pengerjaan di titip.it.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-accent px-6 text-sm font-semibold text-accent-ink transition hover:brightness-110"
          >
            Kembali ke Beranda titip.it
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} weight="bold" />
          Ke Beranda
        </Link>
        <Wordmark />
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-[var(--shadow-card)]">
        {/* Header Bar */}
        <div className="border-b border-line bg-surface-2 p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent-text">
            Ulasan Klien titip.it
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Ceritakan Pengalaman Kamu
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Feedback jujur kamu membantu kami mempertahankan standar pengerjaan, kejujuran kode sumber, dan sesi penjelasan langsung.
          </p>

          {orderCode ? (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-field border border-line bg-surface p-3 text-xs font-mono text-ink-soft">
              <span className="flex items-center gap-1.5 text-accent-text font-semibold">
                <ShieldCheck size={16} weight="bold" />
                Pesanan Terverifikasi:
              </span>
              <span className="text-ink font-semibold">{orderCode}</span>
              {initialTitle ? <span className="text-muted">· {initialTitle}</span> : null}
              {initialServiceName ? (
                <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                  {initialServiceName}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error ? (
            <div className="rounded-field border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-400">
              {error}
            </div>
          ) : null}

          {/* Rating */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
              Tingkat Kepuasan Kamu
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Beri bintang ${star}`}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={28}
                      weight={active ? "fill" : "regular"}
                      className={active ? "text-amber-400" : "text-muted/40"}
                    />
                  </button>
                );
              })}
              <span className="ml-2 font-mono text-sm font-semibold text-ink">
                {rating} dari 5 bintang
              </span>
            </div>
          </div>

          {/* Name & Role */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
                Nama Lengkap / Panggilan
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Rifqi Ananta"
                className="h-11 w-full rounded-field border border-line bg-surface-2 px-3.5 text-sm text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
                Kampus / Peran / Bisnis
              </label>
              <input
                id="role"
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Contoh: Mahasiswa TI, Semarang"
                className="h-11 w-full rounded-field border border-line bg-surface-2 px-3.5 text-sm text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Quote / Testimonial Text */}
          <div>
            <label htmlFor="quote" className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
              Ulasan Kamu
            </label>
            <textarea
              id="quote"
              required
              rows={4}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Ceritakan bagaimana pengerjaan tugas/proyek kamu, komunikasi dengan tim, ketepatan waktu, dan apakah sesi penjelasannya membantu kamu paham..."
              className="w-full rounded-field border border-line bg-surface-2 p-3.5 text-sm leading-relaxed text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none"
            />
            <p className="mt-1 text-[11px] font-mono text-muted">
              {quote.length}/600 karakter
            </p>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-ink-soft select-none">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 size-4 rounded border-line text-accent focus:ring-accent"
            />
            <span>
              Saya bersedia ulasan ini ditampilkan secara publik di beranda titip.it untuk membantu calon klien lain.
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-accent px-6 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <span>Mengirim ulasan...</span>
            ) : (
              <>
                <span>Kirim Ulasan Sekarang</span>
                <PaperPlaneTilt size={17} weight="bold" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
