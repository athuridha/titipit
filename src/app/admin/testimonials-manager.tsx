"use client";

import { useEffect, useState } from "react";
import {
  ArrowClockwise,
  CheckCircle,
  Copy,
  Plus,
  Star,
  Trash,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarSeed: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
};

const card = "rounded-2xl border border-white/10 bg-white/[0.03]";
const field =
  "h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 text-sm text-white placeholder:text-white/30 focus:border-[#0058fe]/60 focus:outline-none";
const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0058fe] px-5 text-sm font-semibold text-white transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-60";
const btnGhost =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white/85 transition hover:bg-white/5 disabled:opacity-50";

export function TestimonialManager({ flash }: { flash: (m: string) => void }) {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Link Generator State
  const [genOrderCode, setGenOrderCode] = useState("");
  const [genClientName, setGenClientName] = useState("");
  const [genPhone, setGenPhone] = useState("");

  // Manual Add State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addRole, setAddRole] = useState("");
  const [addQuote, setAddQuote] = useState("");
  const [addRating, setAddRating] = useState(5);
  const [addBusy, setAddBusy] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat testimoni.");
      setItems(data.testimonials);
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(`${label} berhasil disalin ke clipboard!`);
    } catch {
      flash("Gagal menyalin otomatis.");
    }
  }

  async function togglePublish(item: Testimonial) {
    const next = !item.published;
    setItems((prev) =>
      prev ? prev.map((t) => (t.id === item.id ? { ...t, published: next } : t)) : null,
    );

    try {
      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui.");
      flash(next ? "Testimoni ditampilkan di beranda." : "Testimoni disembunyikan.");
    } catch {
      flash("Gagal menyimpan perubahan status.");
      load();
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Yakin ingin menghapus testimoni ini?")) return;
    setItems((prev) => (prev ? prev.filter((t) => t.id !== id) : null));

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus.");
      flash("Testimoni berhasil dihapus.");
    } catch {
      flash("Gagal menghapus testimoni.");
      load();
    }
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    if (addBusy) return;
    setAddBusy(true);

    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          role: addRole.trim(),
          quote: addQuote.trim(),
          rating: addRating,
          published: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah testimoni.");

      setItems((prev) => [data.testimonial, ...(prev ?? [])]);
      setShowAddModal(false);
      setAddName("");
      setAddRole("");
      setAddQuote("");
      setAddRating(5);
      flash("Testimoni manual berhasil ditambahkan dan aktif di beranda.");
    } catch (e: any) {
      alert(e.message || "Gagal menambah.");
    } finally {
      setAddBusy(false);
    }
  }

  const generatedUrl = genOrderCode.trim()
    ? `${origin}/testimoni/${genOrderCode.trim()}`
    : genClientName.trim()
    ? `${origin}/testimoni?nama=${encodeURIComponent(genClientName.trim())}`
    : `${origin}/testimoni`;

  const waTemplate = `Halo Kak ${genClientName.trim() || "Klien"}, terima kasih sudah mempercayakan kebutuhan IT kamu di titip.it. Mohon kesediaannya untuk memberikan ulasan singkat melalui tautan berikut: ${generatedUrl} - Terima kasih banyak!`;

  return (
    <div className="space-y-6">
      {/* SECTION 1: LINK GENERATOR */}
      <div className={`${card} p-5 md:p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#7aa5ff]">
              Generator Tautan Ulasan
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Buat Link Testimoni untuk Klien
            </h2>
            <p className="mt-1 text-xs text-white/60">
              Klien dapat mengisi nama, rating, ulasan, dan izin tayang. Ulasan yang masuk akan langsung muncul di beranda.
            </p>
          </div>

          <button
            type="button"
            onClick={() => copyText(`${origin}/testimoni`, "Link review umum")}
            className={btnGhost}
          >
            <Copy size={15} /> Salin Link Umum
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Kode Pesanan (Opsional)
            </label>
            <input
              type="text"
              value={genOrderCode}
              onChange={(e) => setGenOrderCode(e.target.value)}
              placeholder="Contoh: TITIP-7K2Q9M"
              className={field}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Nama Klien (Opsional)
            </label>
            <input
              type="text"
              value={genClientName}
              onChange={(e) => setGenClientName(e.target.value)}
              placeholder="Contoh: Rifqi Ananta"
              className={field}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Nomor WhatsApp Klien (Opsional)
            </label>
            <input
              type="text"
              value={genPhone}
              onChange={(e) => setGenPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className={field}
            />
          </div>
        </div>

        {/* Link Result & Actions */}
        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1 font-mono text-xs text-[#7aa5ff] break-all">
            {generatedUrl}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => copyText(generatedUrl, "Link testimoni")}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 text-xs font-semibold text-white hover:bg-white/10"
            >
              <Copy size={14} /> Salin Link
            </button>
            <button
              type="button"
              onClick={() => copyText(waTemplate, "Pesan template WhatsApp")}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 text-xs font-semibold text-white hover:bg-white/10"
            >
              <Copy size={14} /> Salin Teks WA
            </button>
            {genPhone.trim() ? (
              <a
                href={`https://wa.me/${genPhone.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(waTemplate)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0058fe] px-3.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <WhatsappLogo size={14} weight="bold" /> Kirim via WA
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* SECTION 2: TESTIMONIALS LIST */}
      <div className={`${card} p-5 md:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Ulasan Klien Terdaftar ({items?.length ?? 0})
            </h2>
            <p className="mt-0.5 text-xs text-white/60">
              Ulasan aktif akan otomatis berjalan di marquee Scrolling Social Proof beranda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className={`${btnGhost} !h-9 !px-3 text-xs`}
              title="Muat ulang data"
            >
              <ArrowClockwise size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className={`${btnPrimary} !h-9 !px-4 text-xs`}
            >
              <Plus size={15} weight="bold" /> Tambah Manual dari Chat
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            {error}
          </p>
        ) : null}

        {loading && !items ? (
          <p className="py-12 text-center text-sm text-white/50">Memuat daftar testimoni...</p>
        ) : items?.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/50">
            Belum ada ulasan klien. Kirimkan link testimoni ke klien setelah pekerjaan selesai!
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {items?.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/30 p-5 transition hover:border-white/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-white/50 line-clamp-1">{item.role}</p>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: item.rating }).map((_, si) => (
                        <Star key={si} size={13} weight="fill" />
                      ))}
                    </div>
                  </div>

                  <blockquote className="mt-4 text-xs leading-relaxed text-white/80 italic">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => togglePublish(item)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold transition ${
                      item.published
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border border-white/15 bg-white/5 text-white/40"
                    }`}
                  >
                    <CheckCircle size={13} weight={item.published ? "fill" : "regular"} />
                    {item.published ? "Tampil di Beranda" : "Disembunyikan"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 text-white/40 hover:text-red-400 transition"
                    title="Hapus testimoni"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL TAMBAH MANUAL */}
      {showAddModal ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#101215] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Tambah Testimoni Manual</h3>
            <p className="mt-1 text-xs text-white/60">
              Gunakan jika klien mengirimkan testimoni langsung via WhatsApp atau chat.
            </p>

            <form onSubmit={submitManual} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Nama Klien
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Contoh: Dimas Aditya"
                  className={field}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Peran / Kampus / Bisnis
                </label>
                <input
                  type="text"
                  required
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  placeholder="Contoh: Mahasiswa SI, Surabaya"
                  className={field}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Rating
                </label>
                <select
                  value={addRating}
                  onChange={(e) => setAddRating(Number(e.target.value))}
                  className={field}
                >
                  <option value={5}>5 Bintang (Sangat Puas)</option>
                  <option value={4}>4 Bintang (Puas)</option>
                  <option value={3}>3 Bintang (Cukup)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Isi Ulasan
                </label>
                <textarea
                  required
                  rows={3}
                  value={addQuote}
                  onChange={(e) => setAddQuote(e.target.value)}
                  placeholder="Tulis ulasan yang disampaikan klien..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-white/30 focus:border-[#0058fe]/60 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={btnGhost}
                >
                  Batal
                </button>
                <button type="submit" disabled={addBusy} className={btnPrimary}>
                  {addBusy ? "Menyimpan..." : "Simpan Testimoni"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
