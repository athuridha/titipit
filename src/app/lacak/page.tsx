"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { statusLabel, statusProgress } from "@/lib/status";
import { formatDateTime, formatRupiah } from "@/lib/format";

type Tracked = {
  code: string;
  title: string;
  status: keyof typeof statusLabel;
  quotedPrice: number | null;
  deadline: string | null;
  createdAt: string;
  name: string;
  service: { name: string; turnaround: string };
  events: { status: string; note: string; createdAt: string }[];
};

const track = ["Menunggu review", "Menunggu pembayaran", "Dikerjakan", "Selesai"];

function TrackForm() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("kode") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Tracked | null>(null);

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError("Masukkan kode pesanan dulu.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(normalized)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kode tidak ditemukan.");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Jaringan bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const progress = order ? statusProgress(order.status) : -2;
  const cancelled = order?.status === "DIBATALKAN";

  return (
    <div>
      <form onSubmit={lookup} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="kode" className="sr-only">Kode pesanan</label>
        <input
          id="kode"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="cth: TITIP-7K2Q9M"
          spellCheck={false}
          autoComplete="off"
          className="h-13 flex-1 rounded-pill border border-line bg-surface px-6 font-mono text-[0.9375rem] tracking-[0.1em] text-ink placeholder:text-muted/60 placeholder:tracking-normal focus:border-accent-hairline focus:outline-none"
        />
        <Button type="submit" size="lg" disabled={loading}>
          <MagnifyingGlass size={17} weight="bold" aria-hidden />
          {loading ? "Mencari…" : "Lacak"}
        </Button>
      </form>
      {error ? (
        <p role="alert" className="mt-4 rounded-field border border-danger/40 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      {order ? (
        <div className="mt-8 overflow-hidden rounded-card border border-line bg-surface">
          <div className="border-b border-line p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs tracking-[0.14em] text-muted">{order.code} · {order.service.name}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">{order.title}</h2>
                <p className="mt-1 text-sm text-muted">
                  Halo {order.name}, pesanan dibuat {formatDateTime(order.createdAt)}. Estimasi {order.service.turnaround}.
                </p>
              </div>
              <span className={`rounded-pill border px-4 py-1.5 text-xs font-semibold ${cancelled ? "border-danger/40 bg-danger-soft text-danger" : "border-accent-hairline bg-accent-soft text-accent-text"}`}>
                {statusLabel[order.status]}
              </span>
            </div>

            {!cancelled ? (
              <ol className="mt-7 grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Progres pesanan">
                {track.map((label, i) => {
                  const done = i <= progress;
                  const current = i === progress;
                  return (
                    <li key={label} className={`rounded-field border px-3 py-2.5 text-xs font-semibold ${done ? "border-accent-hairline bg-accent-soft text-ink" : "border-line text-muted"}`}>
                      <span className="mr-2 font-mono">{i + 1}</span>
                      {label}{current ? " · posisi kamu" : ""}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-6 rounded-field border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger">
                Pesanan ini dibatalkan. Hubungi operator kalau kamu merasa ini keliru.
              </p>
            )}

            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Harga disepakati</dt>
                <dd className="mt-1 font-semibold">{order.quotedPrice !== null ? formatRupiah(order.quotedPrice) : "Menunggu review"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Deadline</dt>
                <dd className="mt-1 font-semibold">{order.deadline ? formatDateTime(order.deadline) : "Fleksibel"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Layanan</dt>
                <dd className="mt-1 font-semibold">{order.service.name}</dd>
              </div>
            </dl>
          </div>

          <ol className="divide-y divide-[var(--border)]">
            {order.events.map((ev, i) => (
              <li key={`${ev.createdAt}-${i}`} className="flex gap-4 p-6 md:px-8">
                <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${i === order.events.length - 1 ? "bg-accent" : "bg-line-strong"}`} aria-hidden />
                <div>
                  <p className="text-sm font-semibold">{statusLabel[ev.status as keyof typeof statusLabel] ?? ev.status}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{ev.note}</p>
                  <p className="mt-1 font-mono text-xs text-muted">{formatDateTime(ev.createdAt)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

export default function LacakPage() {
  return (
    <Container className="max-w-[880px] py-12 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-text">Cek pesanan</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tighter md:text-5xl">
        Pesananmu sampai mana?
      </h1>
      <p className="mt-4 max-w-[58ch] leading-relaxed text-muted">
        Masukkan kode yang diterima setelah kirim brief. Formatnya seperti TITIP-XXXXXX. Kode hanya menampilkan nama depanmu.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="text-sm text-muted">Memuat…</div>}>
          <TrackForm />
        </Suspense>
      </div>
    </Container>
  );
}
