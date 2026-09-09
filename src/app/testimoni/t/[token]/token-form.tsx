"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  PaperPlaneTilt,
  ShieldCheck,
  SpinnerGap,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/wordmark";

type Props = {
  token: string;
  orderCode: string;
  initialName: string;
  initialTitle: string;
  initialServiceName: string;
};

export function TokenTestimonialForm({
  token,
  orderCode,
  initialName,
  initialTitle,
  initialServiceName,
}: Props) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(initialName);
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
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
      const res = await fetch("/api/testimonials/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name.trim(),
          role: role.trim(),
          quote: quote.trim(),
          rating,
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
          Ulasan kamu telah tersimpan. Feedback ini membantu calon klien lain melihat kualitas pengerjaan di titip.it.
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
        {/* Header */}
        <div className="border-b border-line bg-surface-2 p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent-text">
            Ulasan Klien titip.it
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Ceritakan Pengalaman Kamu
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Link ini hanya bisa digunakan satu kali. Feedback jujur kamu membantu kami mempertahankan standar pengerjaan.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-field border border-line bg-surface p-3 text-xs font-mono text-ink-soft">
            <span className="flex items-center gap-1.5 text-accent-text font-semibold">
              <ShieldCheck size={16} weight="bold" />
              Pesanan Terverifikasi:
            </span>
            <span className="text-ink font-semibold">{orderCode}</span>
            <span className="text-muted">· {initialTitle}</span>
            <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
              {initialServiceName}
            </span>
          </div>
        </div>

        {/* Form */}
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
                Nama
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 w-full rounded-field bg-surface-2 px-4 text-sm text-ink placeholder:text-muted focus:ring-2 focus:ring-accent/30 focus:outline-none"
                placeholder="Nama kamu"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
                Kampus / Bisnis / Peran
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="h-11 w-full rounded-field bg-surface-2 px-4 text-sm text-ink placeholder:text-muted focus:ring-2 focus:ring-accent/30 focus:outline-none"
                placeholder="cth: Mahasiswa UGM"
              />
            </div>
          </div>

          {/* Quote */}
          <div>
            <label htmlFor="quote" className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
              Ulasan Kamu
            </label>
            <textarea
              id="quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              required
              minLength={10}
              rows={4}
              className="w-full rounded-field bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-muted focus:ring-2 focus:ring-accent/30 focus:outline-none resize-none"
              placeholder="Ceritakan pengalaman kamu menggunakan jasa titip.it…"
            />
          </div>

          {/* Consent */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 size-4 rounded accent-[var(--accent)]"
            />
            <span className="text-xs text-muted leading-relaxed">
              Saya mengizinkan ulasan ini ditampilkan di halaman utama titip.it sebagai testimoni publik.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !consent}
            className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-pill bg-accent px-6 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <SpinnerGap size={18} weight="bold" className="animate-spin" />
                Mengirim…
              </>
            ) : (
              <>
                <PaperPlaneTilt size={18} weight="bold" />
                Kirim Ulasan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
