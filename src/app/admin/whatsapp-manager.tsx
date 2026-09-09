"use client";

import { useEffect, useState } from "react";
import { WhatsappLogo, X } from "@phosphor-icons/react/dist/ssr";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type WaRow = {
  id: string;
  label: string;
  number: string;
  active: boolean;
  sortOrder: number;
};

const card = "rounded-2xl border border-white/[0.08] bg-[#0d1322] shadow-xl backdrop-blur-xl";
const field =
  "h-11 w-full rounded-xl border border-white/10 bg-[#080c16] px-3.5 text-sm text-white placeholder:text-white/30 focus:border-[#0058fe] focus:outline-none";
const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0058fe] px-5 text-sm font-semibold text-white shadow-md shadow-[#0058fe]/20 transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-60";
const labelStyle = "mb-1.5 block text-xs font-semibold text-white/70";
const muted = "text-white/50";

export function WhatsappManager({ flash }: { flash: (m: string) => void }) {
  const [rows, setRows] = useState<WaRow[] | null>(null);
  const [label, setLabel] = useState("");
  const [number, setNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [deletingRow, setDeletingRow] = useState<WaRow | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/whatsapp");
      const data = await res.json();
      if (res.ok) setRows(data.numbers);
    } catch {
      setMsg("Gagal memuat nomor WhatsApp.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, number }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.fields?.number ?? data.fields?.label ?? data.error ?? "Gagal menambah.");
        return;
      }
      setRows((list) => [...(list ?? []), data.number]);
      setLabel("");
      setNumber("");
      flash("Nomor WhatsApp berhasil ditambahkan.");
    } catch {
      setMsg("Jaringan bermasalah. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(row: WaRow) {
    const res = await fetch(`/api/admin/whatsapp/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !row.active }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Gagal menyimpan.");
      return;
    }
    setRows((list) => list?.map((r) => (r.id === row.id ? data.number : r)) ?? null);
    flash(row.active ? "Nomor dinonaktifkan." : "Nomor diaktifkan.");
  }

  async function confirmRemove() {
    if (!deletingRow) return;
    const res = await fetch(`/api/admin/whatsapp/${deletingRow.id}`, { method: "DELETE" });
    if (!res.ok) {
      setMsg("Gagal menghapus.");
      setDeletingRow(null);
      return;
    }
    setRows((list) => list?.filter((r) => r.id !== deletingRow.id) ?? null);
    flash("Nomor dihapus.");
    setDeletingRow(null);
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={Boolean(deletingRow)}
        title="Hapus Nomor WhatsApp"
        description={`Hapus ${deletingRow?.label} (${deletingRow?.number})?\nNomor ini tidak akan lagi digunakan untuk kontak WhatsApp.`}
        confirmText="Hapus Nomor"
        onConfirmAction={confirmRemove}
        onCancelAction={() => setDeletingRow(null)}
      />
      <div className={`${card} p-5 md:p-6`}>
        <h2 className="text-lg font-semibold text-white">Nomor WhatsApp Handoff</h2>
        <p className={`mt-1 text-xs ${muted}`}>
          Nomor aktif yang digunakan untuk menghubungkan pengunjung beranda ke obrolan WhatsApp operator. Nomor pertama yang aktif menjadi tujuan utama tombol CTA.
        </p>
        {msg ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300"
          >
            {msg}
          </p>
        ) : null}
        <form onSubmit={add} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="wa-label" className={labelStyle}>
              Nama Label
            </label>
            <input
              id="wa-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="cth: Operator 1"
              maxLength={40}
              required
              minLength={3}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="wa-number" className={labelStyle}>
              Nomor Telepon
            </label>
            <input
              id="wa-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="cth: 081234567890"
              inputMode="tel"
              required
              className={field}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? "Menyimpan…" : "Tambah Nomor"}
            </button>
          </div>
        </form>
      </div>

      <div className={`${card} overflow-hidden`}>
        {rows === null ? (
          <p className={`p-8 text-center text-sm ${muted}`}>Memuat nomor WhatsApp…</p>
        ) : rows.length === 0 ? (
          <p className={`p-8 text-center text-sm ${muted}`}>
            Belum ada nomor WhatsApp khusus. Tambahkan satu lewat formulir di atas.
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.08]">
            {rows.map((r, i) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 p-4 md:px-5"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl border ${
                    r.active
                      ? "border-[#0058fe]/40 bg-[#0058fe]/15 text-[#7aa5ff]"
                      : "border-white/10 text-white/40"
                  }`}
                >
                  <WhatsappLogo size={19} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{r.label}</span>
                    {i === 0 && r.active ? (
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        UTAMA
                      </span>
                    ) : null}
                    {!r.active ? (
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white/50">
                        NONAKTIF
                      </span>
                    ) : null}
                  </span>
                  <span className={`mt-0.5 block font-mono text-xs ${muted}`}>{r.number}</span>
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(r)}
                    className="inline-flex h-9 items-center rounded-full border border-white/15 bg-white/[0.03] px-3.5 text-xs font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    {r.active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingRow(r)}
                    aria-label={`Hapus ${r.label}`}
                    className="grid size-9 place-items-center rounded-full border border-white/15 text-white/60 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <X size={15} weight="bold" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
