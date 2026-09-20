"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeSlash,
  Lock,
  SpinnerGap,
} from "@phosphor-icons/react/dist/ssr";

const field =
  "h-12 w-full rounded-xl bg-[#f1f5fb] px-4 text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#2563eb]/30 focus:outline-none";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak sama.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.fields?.password ?? data.fields?.confirmPassword ?? data.error ?? "Gagal mengubah password.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Jaringan bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

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
      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center px-4 py-12">
        <div className="w-full overflow-hidden rounded-2xl bg-white p-7 shadow-sm md:p-9">
          <p className="flex items-center gap-2.5">
            <Image
              src="/logo-mark.png"
              alt=""
              width={44}
              height={35}
              priority
              className="h-8 w-auto"
            />
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              titip<span className="text-blue-600">.</span>it{" "}
              <span className="font-normal text-slate-500">/ admin</span>
            </span>
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Lock size={20} weight="bold" aria-hidden />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                Ganti Password
              </h1>
              <p className="text-sm text-slate-500">
                Buat password baru untuk keamanan akun kamu.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-800">
              Akun kamu baru dibuat oleh Super Admin. Silakan buat password baru
              sebelum mengakses dashboard.
            </p>
          </div>

          <form onSubmit={submit} className="mt-6">
            {error ? (
              <p
                role="alert"
                className="mb-5 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500"
              >
                {error}
              </p>
            ) : null}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password Baru
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${field} pr-12`}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
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

            <div className="mt-5">
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${field} pr-12`}
                  placeholder="Ulangi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {showConfirm ? (
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
                  Menyimpan…
                </>
              ) : (
                "Simpan Password Baru"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
