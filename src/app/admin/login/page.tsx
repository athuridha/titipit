"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeSlash,
  Kanban,
  SpinnerGap,
  Tag,
  Timer,
} from "@phosphor-icons/react/dist/ssr";

const field =
  "h-12 w-full rounded-xl border border-[#1e3a63] bg-[#f1f5fb] px-4 text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:border-[#2563eb]/70 focus:outline-none";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal masuk.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Jaringan bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {error ? (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500"
        >
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-700">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          spellCheck={false}
          required
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          className={field}
          placeholder="nama_operator"
        />
      </div>
      <div className="mt-5">
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${field} pr-12`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            {showPassword ? (
              <EyeSlash size={18} aria-hidden />
            ) : (
              <Eye size={18} aria-hidden />
            )}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-7 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-base font-semibold text-white transition hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-60"
      >
        {loading ? (
          <>
            <SpinnerGap size={19} weight="bold" aria-hidden className="animate-spin" />
            Memeriksa…
          </>
        ) : (
          "Masuk dashboard"
        )}
      </button>
      <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
        Sesi bertahan 8 jam di perangkat ini.
      </p>
    </form>
  );
}

const highlights = [
  {
    icon: Kanban,
    title: "Kanban proses",
    body: "Seret kartu antar tahap, dari review sampai selesai.",
  },
  {
    icon: Tag,
    title: "Harga & status",
    body: "Tetapkan harga fix, klien langsung melihatnya.",
  },
  {
    icon: Timer,
    title: "Riwayat otomatis",
    body: "Setiap update tercatat rapi di timeline pesanan.",
  },
] as const;

export default function AdminLoginPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(55% 50% at 50% 0%, rgba(47,123,255,0.16) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid w-full max-w-[960px] gap-5 px-4 py-12 md:py-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Panel branding */}
        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#ffffff] p-7 md:p-9">
          <p className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-blue-600 font-mono text-sm font-bold text-white">
              T
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              titip.it <span className="font-normal text-slate-500">/ admin</span>
            </span>
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[#2563eb]">
            Operator
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tighter text-slate-900 md:text-4xl">
            Kelola pesanan dalam satu panel.
          </h1>
          <ul className="mt-8 space-y-5">
            {highlights.map((h) => (
              <li key={h.title} className="flex gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#e2e8f0] bg-[#f1f5fb] text-[#2563eb]">
                  <h.icon size={19} weight="bold" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{h.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-slate-500">
                    {h.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-8 hidden items-center gap-2 border-t border-[#eef2f7] pt-5 text-xs text-slate-500 lg:flex">
            <CheckCircle size={15} weight="fill" className="text-emerald-500" aria-hidden />
            Khusus operator — halaman ini tidak terindeks publik.
          </p>
        </div>

        {/* Panel form */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-[#ffffff] p-7 md:p-9">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Masuk dashboard.</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Gunakan akun operator yang sudah dibuat.
          </p>
          <div className="mt-6">
            <Suspense fallback={<div className="text-sm text-slate-500">Memuat…</div>}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-6 border-t border-[#eef2f7] pt-5 text-center text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={15} weight="bold" aria-hidden />
              Kembali ke situs
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
