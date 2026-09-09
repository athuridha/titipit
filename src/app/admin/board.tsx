"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowClockwise,
  ArrowRight,
  Bell,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChartBar,
  CheckCircle,
  ClipboardText,
  Code,
  Copy,
  Cube,
  DownloadSimple,
  EnvelopeSimple,
  FolderOpen,
  Gear,
  House,
  Kanban,
  ListBullets,
  MagnifyingGlass,
  Plus,
  SignOut,
  Star,
  Trash,
  Users,
  Wallet,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { categoryLabel, statusLabel, statusOrder } from "@/lib/status";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { site } from "@/lib/site";
import { WorldMap, type MapArc } from "@/components/world-map";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Status = (typeof statusOrder)[number];
type OrderEvent = { status: string; note: string; createdAt: string };
type Order = {
  id: string;
  code: string;
  name: string;
  email: string;
  whatsapp: string;
  campus: string | null;
  title: string;
  brief: string;
  attachmentUrl?: string | null;
  urgency: string;
  deadline: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  status: Status;
  quotedPrice: number | null;
  createdAt: string;
  serviceId: string;
  service: { name: string };
  events: OrderEvent[];
};
type ServiceItem = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  priceFrom: number | null;
  turnaround: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};
type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  published: boolean;
  sortOrder: number;
};

type View =
  | "dashboard"
  | "pesanan"
  | "produk"
  | "pelanggan"
  | "portofolio"
  | "whatsapp"
  | "testimoni"
  | "laporan"
  | "pengaturan";

/** Koneksi header: Indonesia sebagai pusat ke seluruh dunia. */
const headerArcs: MapArc[] = [
  { start: { lat: -6.2, lng: 106.85 }, end: { lat: 35.68, lng: 139.69 } },
  { start: { lat: -6.2, lng: 106.85 }, end: { lat: -33.87, lng: 151.21 } },
  { start: { lat: -6.2, lng: 106.85 }, end: { lat: 52.52, lng: 13.4 } },
  { start: { lat: -6.2, lng: 106.85 }, end: { lat: 37.77, lng: -122.42 } },
  { start: { lat: -6.2, lng: 106.85 }, end: { lat: 40.71, lng: -74.0 } },
  { start: { lat: -6.2, lng: 106.85 }, end: { lat: 51.5, lng: -0.12 } },
  { start: { lat: 3.6, lng: 98.67 }, end: { lat: 25.2, lng: 55.27 } },
  { start: { lat: -7.25, lng: 112.75 }, end: { lat: 1.35, lng: 103.82 } },
];

/** Urutan proses normal — tombol "maju" mengikuti jalur ini. */
const NEXT: Partial<Record<Status, Status>> = {
  MENUNGGU_REVIEW: "MENUNGGU_PEMBAYARAN",
  MENUNGGU_PEMBAYARAN: "DIKERJAKAN",
  DIKERJAKAN: "SELESAI",
  REVISI: "DIKERJAKAN",
};

const DOT: Record<string, string> = {
  MENUNGGU_REVIEW: "bg-amber-500",
  MENUNGGU_PEMBAYARAN: "bg-sky-500",
  DIKERJAKAN: "bg-blue-600",
  REVISI: "bg-violet-500",
  SELESAI: "bg-emerald-500",
  DIBATALKAN: "bg-red-500",
};

const PILL: Record<string, string> = {
  MENUNGGU_REVIEW: "bg-amber-50 text-amber-700",
  MENUNGGU_PEMBAYARAN: "bg-sky-50 text-sky-700",
  DIKERJAKAN: "bg-blue-50 text-blue-700",
  REVISI: "bg-violet-50 text-violet-700",
  SELESAI: "bg-emerald-50 text-emerald-700",
  DIBATALKAN: "bg-red-50 text-red-600",
};

/* ---------- design tokens (light mood) ---------- */
const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-60";
const btnGhost =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50";
const field =
  "h-11 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none";
const card =
  "rounded-2xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]";
const muted = "text-slate-500";
const label = "mb-1.5 block text-xs font-semibold text-slate-600";
const th =
  "px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400";
const td = "px-4 py-3.5 text-sm";

function waNumber(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) return `62${d.slice(1)}`;
  return d;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function lastDays(n: number) {
  const out: { key: string; label: string; date: Date }[] = [];
  const fmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    out.push({ key: dayKey(date), label: fmt.format(date), date });
  }
  return out;
}

function timeAgo(iso: string) {
  const diff = Date.now() - +new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return formatDateTime(iso);
}

/* ---------- tiny charts (pure SVG, no deps) ---------- */
function Spark({ data, stroke }: { data: number[]; stroke: string }) {
  const gid = useId();
  const w = 132;
  const h = 42;
  const max = Math.max(...data, 1);
  const pts = data
    .map(
      (v, i) =>
        `${((i / Math.max(data.length - 1, 1)) * w).toFixed(1)},${(h - 4 - (v / max) * (h - 10)).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-32 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity={0.25} />
          <stop offset="1" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gid})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AreaChart({
  labels,
  values,
  color,
  height = 220,
}: {
  labels: string[];
  values: number[];
  color: string;
  height?: number;
}) {
  const gid = useId();
  const W = 560;
  const H = height;
  const P = { l: 34, r: 14, t: 14, b: 30 };
  const max = Math.max(...values, 4);
  const step = max <= 8 ? 1 : Math.ceil(max / 4);
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  const x = (i: number) =>
    P.l + (i / Math.max(values.length - 1, 1)) * (W - P.l - P.r);
  const y = (v: number) => H - P.b - (v / max) * (H - P.t - P.b);
  const line = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)},${H - P.b} L${x(0).toFixed(1)},${H - P.b} Z`;
  const every = Math.max(1, Math.ceil(labels.length / 7));
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Grafik jumlah pesanan per hari"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.22} />
          <stop offset="1" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#e8eef7" strokeWidth={1} />
          <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#94a3b8">
            {t}
          </text>
        </g>
      ))}
      {labels.map((l, i) =>
        i % every === 0 ? (
          <text
            key={`${l}-${i}`}
            x={x(i)}
            y={H - 10}
            textAnchor="middle"
            fontSize={11}
            fill="#94a3b8"
          >
            {l}
          </text>
        ) : null,
      )}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 4.5 : 2.5} fill={color}>
          <title>{`${labels[i]}: ${v} pesanan`}</title>
        </circle>
      ))}
    </svg>
  );
}

/* ---------- Service manager ---------- */
function ServiceManager({
  services,
  setServices,
  orders,
  flash,
}: {
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  orders: Order[];
  flash: (m: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DEVELOPMENT");
  const [priceFrom, setPriceFrom] = useState("");
  const [turnaround, setTurnaround] = useState("");
  const [deliverablesText, setDeliverablesText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [deletingService, setDeletingService] = useState<ServiceItem | null>(null);
  const [alertInfo, setAlertInfo] = useState<string | null>(null);

  function resetForm() {
    setName(""); setSlug(""); setTagline(""); setDescription("");
    setCategory("DEVELOPMENT"); setPriceFrom(""); setTurnaround(""); setDeliverablesText("");
    setEditing(null); setShowForm(false);
  }

  function startEdit(s: any) {
    setEditing(s); setName(s.name); setSlug(s.slug); setTagline(s.tagline);
    setDescription(s.description || ""); setCategory(s.category);
    setPriceFrom(s.priceFrom === null ? "" : String(s.priceFrom)); setTurnaround(s.turnaround);
    setDeliverablesText((s.deliverables || []).join("\n"));
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMsg("");
    const deliverables = deliverablesText.split("\n").map((d) => d.trim()).filter(Boolean);
    const payload = {
      name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      tagline, description: description || tagline,
      category, priceFrom: priceFrom.trim() === "" ? null : Number(priceFrom),
      turnaround, deliverables,
    };
    try {
      const url = editing ? `/api/admin/services/${editing.id}` : "/api/admin/services";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? "Gagal menyimpan."); return; }
      if (editing) {
        setServices((list) => list.map((x) => (x.id === editing.id ? { ...x, ...data.service } : x)));
        flash("Layanan diperbarui.");
      } else {
        setServices((list) => [...list, data.service]);
        flash("Layanan ditambahkan.");
      }
      resetForm();
    } catch { setMsg("Jaringan bermasalah."); } finally { setBusy(false); }
  }

  function remove(s: ServiceItem) {
    const antrean = orders.filter((o) => o.serviceId === s.id).length;
    if (antrean > 0) {
      setAlertInfo(`Tidak bisa menghapus layanan ini karena masih ada ${antrean} pesanan terkait.`);
      return;
    }
    setDeletingService(s);
  }

  async function confirmDeleteService() {
    if (!deletingService) return;
    try {
      const res = await fetch(`/api/admin/services/${deletingService.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? "Gagal menghapus."); return; }
      setServices((list) => list.filter((x) => x.id !== deletingService.id));
      flash("Layanan dihapus.");
    } catch { setMsg("Gagal menghapus."); } finally {
      setDeletingService(null);
    }
  }

  async function toggle(s: ServiceItem, patch: { active?: boolean; featured?: boolean }) {
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setServices((list) => list.map((x) => (x.id === s.id ? { ...x, ...patch } : x)));
      flash("Status layanan diperbarui.");
    } catch { flash("Gagal menyimpan."); }
  }

  return (
    <>
      <ConfirmDialog
        open={Boolean(deletingService)}
        title="Hapus Layanan"
        description={`Hapus layanan "${deletingService?.name}"?\nData layanan tidak akan lagi tampil di landing page.`}
        confirmText="Hapus Layanan"
        onConfirmAction={confirmDeleteService}
        onCancelAction={() => setDeletingService(null)}
      />
      <ConfirmDialog
        open={Boolean(alertInfo)}
        title="Pemberitahuan"
        description={alertInfo ?? ""}
        variant="warning"
        confirmText="Mengerti"
        cancelText="Tutup"
        onConfirmAction={() => setAlertInfo(null)}
        onCancelAction={() => setAlertInfo(null)}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Produk & Layanan</h1>
          <p className={`mt-1 text-sm ${muted}`}>
            {services.filter((s) => s.active).length} dari {services.length} layanan tampil di situs.
          </p>
        </div>
        <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className={btnPrimary}>
          <Plus size={16} weight="bold" aria-hidden /> Tambah Layanan
        </button>
      </div>

      {msg ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{msg}</p> : null}

      {showForm ? (
        <div className={`${card} mt-4 p-5 md:p-6`}>
          <h2 className="text-lg font-semibold text-slate-900">{editing ? "Edit Layanan" : "Tambah Layanan Baru"}</h2>
          <form onSubmit={save} className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={label}>Nama Layanan</label><input value={name} onChange={(e) => { setName(e.target.value); if (!editing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} required minLength={3} className={field} placeholder="cth: Web Aplikasi" /></div>
              <div><label className={label}>Slug URL</label><input value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9-]+" className={field} placeholder="cth: web-aplikasi" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className={label}>Kategori</label><select value={category} onChange={(e) => setCategory(e.target.value)} className={field}><option value="AKADEMIK">Akademik</option><option value="DEVELOPMENT">Development</option><option value="DESIGN">Design</option><option value="DATA">Data</option><option value="INFRA">Infra</option></select></div>
              <div>
                <label className={label}>Harga Mulai (Rp)</label>
                <input type="number" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} min={0} className={field} placeholder="Kosongkan jika harga custom" />
                <p className={`mt-1 text-[11px] ${muted}`}>Kosongkan untuk menampilkan “Hubungi kami”.</p>
              </div>
              <div><label className={label}>Estimasi Waktu</label><input value={turnaround} onChange={(e) => setTurnaround(e.target.value)} required className={field} placeholder="cth: 2-5 hari" /></div>
            </div>
            <div><label className={label}>Tagline Singkat</label><input value={tagline} onChange={(e) => setTagline(e.target.value)} required className={field} placeholder="cth: Fullstack web responsif & modern" /></div>
            <div><label className={label}>Deskripsi Lengkap</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${field} !h-auto py-2.5`} placeholder="Jelaskan cakupan pengerjaan layanan ini…" /></div>
            <div><label className={label}>Deliverables / Termasuk (satu per baris)</label><textarea value={deliverablesText} onChange={(e) => setDeliverablesText(e.target.value)} rows={3} className={`${field} !h-auto py-2.5 font-mono text-xs`} placeholder="Source code lengkap&#10;Dokumentasi setup&#10;Sesi penjelasan 30 menit" /></div>
            <div className="flex gap-2">
              <button type="button" onClick={resetForm} className={btnGhost}>Batal</button>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Menyimpan…" : editing ? "Simpan Perubahan" : "Tambah Layanan"}</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className={`${card} mt-4 overflow-hidden`}>
        <ul className="divide-y divide-slate-100">
          {services.map((s) => {
            const antrean = orders.filter((o) => o.serviceId === s.id).length;
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 p-4 md:px-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Cube size={19} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{s.name}</span>
                    {!s.active ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">SEMBUNYI</span> : null}
                    {s.featured ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700"><Star size={11} weight="fill" aria-hidden /> UNGGULAN</span> : null}
                  </span>
                  <span className={`mt-0.5 block truncate text-[13px] ${muted}`}>
                    {categoryLabel[s.category as keyof typeof categoryLabel] ?? s.category} · {s.priceFrom === null ? "hubungi kami" : `mulai ${formatRupiah(s.priceFrom)}`} · {s.turnaround} · {antrean} pesanan
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <button type="button" onClick={() => startEdit(s)} className={btnGhost}>Edit</button>
                  <button type="button" onClick={() => toggle(s, { featured: !s.featured })} aria-label={s.featured ? "Cabut unggulan" : "Jadikan unggulan"} className={`grid size-9 place-items-center rounded-xl transition ${s.featured ? "bg-amber-50 text-amber-500" : "text-slate-300 hover:text-slate-500"}`}><Star size={16} weight={s.featured ? "fill" : "regular"} aria-hidden /></button>
                  <button type="button" role="switch" aria-checked={s.active} aria-label={`Tampilkan ${s.name} di situs`} onClick={() => toggle(s, { active: !s.active })} className={`relative h-6 w-11 rounded-full transition ${s.active ? "bg-blue-600" : "bg-slate-200"}`}><span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${s.active ? "left-[22px]" : "left-0.5"}`} aria-hidden /></button>
                  <button type="button" onClick={() => remove(s)} aria-label={`Hapus ${s.name}`} className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"><Trash size={16} /></button>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

/* ---------- Portfolio manager ---------- */
type PortfolioRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  projectUrl: string | null;
  tags: string[];
  published: boolean;
  sortOrder: number;
};

function PortfolioManager({ flash }: { flash: (m: string) => void }) {
  const [rows, setRows] = useState<PortfolioRow[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioRow | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [deletingPortfolio, setDeletingPortfolio] = useState<PortfolioRow | null>(null);

  useEffect(() => {
    fetch("/api/admin/portfolio")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setRows(data.items); })
      .catch(() => setMsg("Gagal memuat portofolio."));
  }, []);

  function resetForm() {
    setTitle(""); setDescription(""); setCategory(""); setImageUrl(""); setProjectUrl(""); setTagsText("");
    setEditing(null); setShowForm(false);
  }

  function startEdit(p: PortfolioRow) {
    setEditing(p); setTitle(p.title); setDescription(p.description); setCategory(p.category);
    setImageUrl(p.imageUrl ?? ""); setProjectUrl(p.projectUrl ?? ""); setTagsText(p.tags.join(", "));
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMsg("");
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = { title, description, category, imageUrl: imageUrl || undefined, projectUrl: projectUrl || undefined, tags };
    try {
      const url = editing ? `/api/admin/portfolio/${editing.id}` : "/api/admin/portfolio";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? "Gagal menyimpan."); return; }
      if (editing) {
        setRows((list) => list?.map((r) => (r.id === editing.id ? data.item : r)) ?? null);
        flash("Portofolio diperbarui.");
      } else {
        setRows((list) => [...(list ?? []), data.item]);
        flash("Portofolio ditambahkan.");
      }
      resetForm();
    } catch { setMsg("Jaringan bermasalah."); } finally { setBusy(false); }
  }

  async function togglePublish(p: PortfolioRow) {
    const res = await fetch(`/api/admin/portfolio/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !p.published }) });
    if (!res.ok) { flash("Gagal menyimpan."); return; }
    const data = await res.json();
    setRows((list) => list?.map((r) => (r.id === p.id ? data.item : r)) ?? null);
    flash(p.published ? "Disembunyikan." : "Ditayangkan.");
  }

  async function confirmDeletePortfolio() {
    if (!deletingPortfolio) return;
    try {
      const res = await fetch(`/api/admin/portfolio/${deletingPortfolio.id}`, { method: "DELETE" });
      if (!res.ok) { flash("Gagal menghapus."); return; }
      setRows((list) => list?.filter((r) => r.id !== deletingPortfolio.id) ?? null);
      flash("Portofolio dihapus.");
    } finally {
      setDeletingPortfolio(null);
    }
  }

  return (
    <>
      <ConfirmDialog
        open={Boolean(deletingPortfolio)}
        title="Hapus Portofolio"
        description={`Hapus portofolio "${deletingPortfolio?.title}"?\nItem portofolio ini tidak akan lagi tampil di situs.`}
        confirmText="Hapus Portofolio"
        onConfirmAction={confirmDeletePortfolio}
        onCancelAction={() => setDeletingPortfolio(null)}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Portofolio</h1>
          <p className={`mt-1 text-sm ${muted}`}>
            {rows ? `${rows.filter((r) => r.published).length} dari ${rows.length} tayang di situs.` : "Memuat…"}
          </p>
        </div>
        <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className={btnPrimary}>
          <Plus size={16} weight="bold" aria-hidden /> Tambah
        </button>
      </div>
      {msg ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{msg}</p> : null}

      {showForm ? (
        <div className={`${card} mt-4 p-5 md:p-6`}>
          <h2 className="text-lg font-semibold text-slate-900">{editing ? "Edit Portofolio" : "Tambah Portofolio"}</h2>
          <form onSubmit={save} className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={label}>Judul</label><input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} className={field} placeholder="Nama proyek" /></div>
              <div><label className={label}>Kategori</label><input value={category} onChange={(e) => setCategory(e.target.value)} required className={field} placeholder="cth: Web App" /></div>
            </div>
            <div><label className={label}>Deskripsi</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} rows={3} className={`${field} !h-auto py-2.5`} placeholder="Deskripsi singkat proyek…" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <label className={label}>Gambar Proyek</label>
                  <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                    {uploadingImg ? "Mengunggah…" : "📁 Upload Gambar"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingImg(true);
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          fd.append("folder", "portfolio");
                          const res = await fetch("/api/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar");
                          setImageUrl(data.url);
                          flash("Gambar berhasil diupload!");
                        } catch (err: any) {
                          setMsg(err.message || "Gagal mengunggah gambar");
                        } finally {
                          setUploadingImg(false);
                        }
                      }}
                    />
                  </label>
                </div>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={field} placeholder="https://... atau klik Upload" />
              </div>
              <div><label className={label}>URL Proyek (opsional)</label><input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} className={field} placeholder="https://..." /></div>
            </div>
            <div><label className={label}>Tags (pisah koma)</label><input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={field} placeholder="React, Next.js, Tailwind" /></div>
            <div className="flex gap-2">
              <button type="button" onClick={resetForm} className={btnGhost}>Batal</button>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Menyimpan…" : editing ? "Simpan" : "Tambah"}</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {rows?.map((p) => (
          <div key={p.id} className={`${card} overflow-hidden`}>
            {p.imageUrl ? (
              <div className="aspect-video bg-slate-100"><img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" /></div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-slate-50"><FolderOpen size={36} className="text-slate-300" /></div>
            )}
            <div className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{p.title}</h3>
                  <p className={`mt-0.5 text-xs ${muted}`}>{p.category}{p.tags.length > 0 ? ` · ${p.tags.join(", ")}` : ""}</p>
                </div>
                {!p.published ? <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">SEMBUNYI</span> : null}
              </div>
              <p className={`mt-2 line-clamp-2 text-sm ${muted}`}>{p.description}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => startEdit(p)} className={btnGhost}>Edit</button>
                <button type="button" onClick={() => togglePublish(p)} className={btnGhost}>{p.published ? "Sembunyikan" : "Tayangkan"}</button>
                <button type="button" onClick={() => setDeletingPortfolio(p)} className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-red-500 transition hover:bg-red-50">Hapus</button>
              </div>
            </div>
          </div>
        ))}
        {rows !== null && rows.length === 0 ? <p className={`${card} p-10 text-center text-sm ${muted} md:col-span-2`}>Belum ada portofolio. Tambahkan satu lewat tombol di atas.</p> : null}
      </div>
    </>
  );
}

/* ---------- WhatsApp manager ---------- */
type WaRow = {
  id: string;
  label: string;
  number: string;
  active: boolean;
  sortOrder: number;
};

function WhatsappManager({ flash }: { flash: (m: string) => void }) {
  const [rows, setRows] = useState<WaRow[] | null>(null);
  const [labelText, setLabelText] = useState("");
  const [number, setNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [deletingWa, setDeletingWa] = useState<WaRow | null>(null);

  useEffect(() => {
    fetch("/api/admin/whatsapp")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setRows(data.numbers);
      })
      .catch(() => setMsg("Gagal memuat. Coba muat ulang halaman."));
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
        body: JSON.stringify({ label: labelText, number }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.fields?.number ?? data.fields?.label ?? data.error ?? "Gagal menambah.");
        return;
      }
      setRows((list) => [...(list ?? []), data.number]);
      setLabelText("");
      setNumber("");
      flash("Nomor ditambahkan.");
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

  async function confirmDeleteWa() {
    if (!deletingWa) return;
    try {
      const res = await fetch(`/api/admin/whatsapp/${deletingWa.id}`, { method: "DELETE" });
      if (!res.ok) {
        setMsg("Gagal menghapus.");
        return;
      }
      setRows((list) => list?.filter((r) => r.id !== deletingWa.id) ?? null);
      flash("Nomor dihapus.");
    } finally {
      setDeletingWa(null);
    }
  }

  return (
    <div>
      <ConfirmDialog
        open={Boolean(deletingWa)}
        title="Hapus Nomor WhatsApp"
        description={`Hapus nomor ${deletingWa?.label} (${deletingWa?.number})?\nNomor tidak akan lagi digunakan di kontak situs.`}
        confirmText="Hapus Nomor"
        onConfirmAction={confirmDeleteWa}
        onCancelAction={() => setDeletingWa(null)}
      />
      <div className={`${card} p-5 md:p-6`}>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Nomor WhatsApp</h2>
        <p className={`mt-1 text-sm ${muted}`}>
          Bisa lebih dari satu. Nomor aktif tampil di footer situs — yang paling atas jadi
          tujuan tombol WhatsApp.
        </p>
        {msg ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
          >
            {msg}
          </p>
        ) : null}
        <form onSubmit={add} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="wa-label" className={label}>
              Nama
            </label>
            <input
              id="wa-label"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              placeholder="cth: Operator 1"
              maxLength={40}
              required
              minLength={3}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="wa-number" className={label}>
              Nomor
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
              {busy ? "Menyimpan…" : "Tambah"}
            </button>
          </div>
        </form>
      </div>

      <div className={`${card} mt-4 overflow-hidden`}>
        {rows === null ? (
          <p className={`p-8 text-center text-sm ${muted}`}>Memuat…</p>
        ) : rows.length === 0 ? (
          <p className={`p-8 text-center text-sm ${muted}`}>
            Belum ada nomor. Tambahkan satu lewat formulir di atas — selama kosong, situs
            memakai nomor cadangan dari pengaturan.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 p-4 md:px-5">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                    r.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <WhatsappLogo size={19} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{r.label}</span>
                    {i === 0 && r.active ? (
                      <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        UTAMA
                      </span>
                    ) : null}
                    {!r.active ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                        NONAKTIF
                      </span>
                    ) : null}
                  </span>
                  <span className={`mt-0.5 block font-mono text-sm ${muted}`}>{r.number}</span>
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(r)}
                    className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {r.active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingWa(r)}
                    aria-label={`Hapus ${r.label}`}
                    className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
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

/* ---------- Fonnte settings ---------- */
type FonnteGroup = { id: string; name: string; memberCount?: number };

function FonnteSettings({ flash }: { flash: (m: string) => void }) {
  const [token, setToken] = useState("");
  const [targetMode, setTargetMode] = useState<"personal" | "group">("personal");
  const [personalNumbers, setPersonalNumbers] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groups, setGroups] = useState<FonnteGroup[] | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.settings?.FONNTE_TOKEN) setToken(data.settings.FONNTE_TOKEN);
        const savedTarget = data?.settings?.FONNTE_TARGET || "";
        if (savedTarget.includes("@g.us")) {
          setTargetMode("group");
          setSelectedGroupId(savedTarget);
        } else {
          setTargetMode("personal");
          setPersonalNumbers(savedTarget);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function fetchGroups(tokenToUse?: string) {
    const t = (tokenToUse || token).trim();
    if (!t) {
      setGroupError("Isi dan simpan Token Fonnte terlebih dahulu.");
      return;
    }
    setLoadingGroups(true);
    setGroupError("");
    try {
      const res = await fetch("/api/admin/fonnte/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: t }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGroupError(data.error || "Gagal mengambil daftar grup.");
        return;
      }
      setGroups(data.groups || []);
      if (data.groups && data.groups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(data.groups[0].id);
      }
    } catch {
      setGroupError("Gagal menghubungi server Fonnte.");
    } finally {
      setLoadingGroups(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg("");

    const finalTarget =
      targetMode === "group" ? selectedGroupId.trim() : personalNumbers.trim();

    try {
      await Promise.all([
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "FONNTE_TOKEN", value: token.trim() }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "FONNTE_TARGET", value: finalTarget }),
        }),
      ]);
      flash("Pengaturan Fonnte tersimpan.");
    } catch {
      setMsg("Gagal menyimpan pengaturan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`${card} p-5 md:p-6`}>
      <h2 className="text-lg font-semibold text-slate-900">Gateway WhatsApp (Fonnte)</h2>
      <p className={`mt-1 text-sm ${muted}`}>
        Notifikasi otomatis ketika ada pesanan baru masuk dari formulir klien.
      </p>

      {msg ? (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {msg}
        </p>
      ) : null}

      <form onSubmit={save} className="mt-5 space-y-5">
        <div>
          <label className={label}>Token API Fonnte</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={loading}
            placeholder="cth: abc123def456..."
            className={field}
          />
          <p className={`mt-1.5 text-xs ${muted}`}>
            Dapatkan token device yang terhubung dari dashboard fonnte.com.
          </p>
        </div>

        <div>
          <label className={label}>Pilih Target Notifikasi</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTargetMode("personal")}
              className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition ${
                targetMode === "personal"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📱 Ke Nomor HP / Orang
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetMode("group");
                if (!groups && token) fetchGroups();
              }}
              className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition ${
                targetMode === "group"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              👥 Ke Grup WhatsApp
            </button>
          </div>
        </div>

        {targetMode === "personal" ? (
          <div>
            <label className={label}>Nomor WhatsApp Tujuan (bisa lebih dari 1)</label>
            <input
              type="text"
              value={personalNumbers}
              onChange={(e) => setPersonalNumbers(e.target.value)}
              placeholder="cth: 081234567890, 089876543210"
              className={field}
            />
            <p className={`mt-1.5 text-xs ${muted}`}>
              Pisahkan dengan tanda koma (,) jika ingin mengirimkan ke lebih dari satu nomor WhatsApp admin.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <label className={label}>Pilih Grup WhatsApp</label>
              <button
                type="button"
                onClick={() => fetchGroups()}
                disabled={loadingGroups}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {loadingGroups ? "Memuat grup…" : "↻ Muat Ulang Grup"}
              </button>
            </div>

            {groupError ? (
              <p className="mt-1.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">
                {groupError}
              </p>
            ) : null}

            {groups && groups.length > 0 ? (
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className={`${field} mt-1`}
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} {g.memberCount ? `(${g.memberCount} anggota)` : ""} - {g.id}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1 space-y-2">
                <input
                  type="text"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  placeholder="cth: 12036302484948@g.us"
                  className={field}
                />
                <button
                  type="button"
                  onClick={() => fetchGroups()}
                  disabled={loadingGroups}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  {loadingGroups ? "Sedang mengambil daftar grup..." : "Klik di sini untuk ambil daftar grup dari nomor Fonnte"}
                </button>
              </div>
            )}
            <p className={`mt-1.5 text-xs ${muted}`}>
              Pilih dari daftar grup yang diikuti oleh nomor WhatsApp Fonnte kamu, atau ketik ID grup secara manual.
            </p>
          </div>
        )}

        <button type="submit" disabled={busy || loading} className={btnPrimary}>
          {busy ? "Menyimpan…" : "Simpan Pengaturan Fonnte"}
        </button>
      </form>
    </div>
  );
}

/* ---------- main board ---------- */
export function AdminBoard({
  name,
  username,
  orders: initial,
  services: servicesInitial,
  testimonials: testimonialsInitial,
}: {
  name: string;
  username: string;
  orders: Order[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);
  const [services, setServices] = useState(servicesInitial);
  const [testimonials, setTestimonials] = useState(testimonialsInitial);
  const [view, setView] = useState<View>("dashboard");
  const [listMode, setListMode] = useState<"daftar" | "kanban">("daftar");
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("SEMUA");
  const [urgency, setUrgency] = useState("SEMUA");
  const [sort, setSort] = useState<"baru" | "lama">("baru");
  const [trendRange, setTrendRange] = useState<7 | 30>(30);
  const [reportRange, setReportRange] = useState<7 | 30>(7);
  const [customerQuery, setCustomerQuery] = useState("");
  const [waChat, setWaChat] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<Status>("MENUNGGU_REVIEW");
  const [formPrice, setFormPrice] = useState("");
  const [formNote, setFormNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [testimonialLinkModal, setTestimonialLinkModal] = useState<string | null>(null);
  const [testimonialOrderTarget, setTestimonialOrderTarget] = useState<Order | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] = useState<TestimonialItem | null>(null);

  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const firstName = name.split(" ")[0];

  useEffect(() => {
    if (selected) {
      setFormStatus(selected.status);
      setFormPrice(selected.quotedPrice?.toString() ?? "");
      setFormNote("");
      setError("");
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = selected || navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected, navOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedId(null);
        setNavOpen(false);
        setUserMenu(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const first = data?.numbers?.[0];
        if (first) setWaChat(`https://wa.me/${waNumber(first.number)}`);
      })
      .catch(() => {});
  }, []);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  /* ----- derived data ----- */
  const stats = useMemo(() => {
    const needReview = orders.filter((o) => o.status === "MENUNGGU_REVIEW").length;
    const active = orders.filter((o) =>
      ["MENUNGGU_PEMBAYARAN", "DIKERJAKAN", "REVISI"].includes(o.status),
    ).length;
    const done = orders.filter((o) => o.status === "SELESAI").length;
    const omzet = orders.reduce(
      (s, o) => s + (o.status !== "DIBATALKAN" && o.quotedPrice ? o.quotedPrice : 0),
      0,
    );
    return { total: orders.length, needReview, active, done, omzet };
  }, [orders]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { SEMUA: orders.length };
    for (const o of orders) map[o.status] = (map[o.status] ?? 0) + 1;
    return map;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = orders.filter((o) => {
      if (status !== "SEMUA" && o.status !== status) return false;
      if (urgency !== "SEMUA" && o.urgency !== urgency) return false;
      if (!q) return true;
      return [o.code, o.title, o.name, o.email, o.whatsapp, o.service.name]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    return [...list].sort((a, b) =>
      sort === "baru"
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt),
    );
  }, [orders, query, status, urgency, sort]);

  const kanbanCols = useMemo(
    () =>
      statusOrder.map((s) => ({
        status: s,
        items: visible.filter((o) => o.status === s),
      })),
    [visible],
  );

  const seriesFor = useMemo(() => {
    const byDay: Record<string, Order[]> = {};
    for (const o of orders) {
      const k = dayKey(new Date(o.createdAt));
      (byDay[k] ??= []).push(o);
    }
    return (n: number) => {
      const days = lastDays(n);
      return {
        days,
        labels: days.map((d) => d.label),
        total: days.map((d) => (byDay[d.key] ?? []).length),
      };
    };
  }, [orders]);

  const trend = useMemo(() => seriesFor(trendRange), [seriesFor, trendRange]);

  const report = useMemo(() => {
    const { days, labels, total } = seriesFor(reportRange);
    const perService = services.map((s) => {
      const list = orders.filter((o) => o.serviceId === s.id);
      return {
        name: s.name,
        count: list.length,
        omzet: list.reduce((sum, o) => sum + (o.quotedPrice ?? 0), 0),
      };
    });
    const priced = orders.filter((o) => o.quotedPrice !== null && o.status !== "DIBATALKAN");
    const omzet = priced.reduce((s, o) => s + (o.quotedPrice ?? 0), 0);
    return {
      days,
      values: total,
      labels,
      perService: [...perService].sort((a, b) => b.count - a.count),
      omzet,
      avg: priced.length > 0 ? Math.round(omzet / priced.length) : 0,
      kilat: orders.filter((o) => o.urgency === "KILAT").length,
      batal: orders.filter((o) => o.status === "DIBATALKAN").length,
    };
  }, [orders, services, reportRange, seriesFor]);

  const customers = useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; whatsapp: string; list: Order[] }
    >();
    for (const o of orders) {
      const key = o.email.trim().toLowerCase();
      const cur = map.get(key);
      if (cur) cur.list.push(o);
      else map.set(key, { name: o.name, email: o.email, whatsapp: o.whatsapp, list: [o] });
    }
    const q = customerQuery.trim().toLowerCase();
    return [...map.values()]
      .filter((c) =>
        !q ? true : [c.name, c.email, c.whatsapp].join(" ").toLowerCase().includes(q),
      )
      .map((c) => ({
        ...c,
        count: c.list.length,
        nilai: c.list.reduce((s, o) => s + (o.quotedPrice ?? 0), 0),
        terakhir: c.list.map((o) => +new Date(o.createdAt)).sort((a, b) => b - a)[0],
      }))
      .sort((a, b) => b.terakhir - a.terakhir);
  }, [orders, customerQuery]);

  const latest = useMemo(() => orders.slice(0, 5), [orders]);

  function pctChange(cur: number, prev: number) {
    if (prev === 0) return cur > 0 ? "+100%" : "0%";
    const pct = Math.round(((cur - prev) / prev) * 100);
    return `${pct > 0 ? "+" : ""}${pct}%`;
  }

  function periodDelta(n: number) {
    const days = lastDays(n * 2);
    const byDay: Record<string, number> = {};
    for (const o of orders) {
      const k = dayKey(new Date(o.createdAt));
      byDay[k] = (byDay[k] ?? 0) + 1;
    }
    const cur = days.slice(n).reduce((s, d) => s + (byDay[d.key] ?? 0), 0);
    const prev = days.slice(0, n).reduce((s, d) => s + (byDay[d.key] ?? 0), 0);
    return pctChange(cur, prev);
  }

  /* ----- mutations ----- */
  async function persist(id: string, next: Status, price: number | undefined, note: string): Promise<{ ok: boolean; testimonialLink?: string }> {
    const prev = orders;
    setOrders((list) =>
      list.map((o) =>
        o.id === id
          ? {
              ...o,
              status: next,
              quotedPrice: price !== undefined ? price : o.quotedPrice,
              events: [
                ...o.events,
                {
                  status: next,
                  note: note || `Status diperbarui menjadi ${statusLabel[next]}.`,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : o,
      ),
    );
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, quotedPrice: price, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan.");
      setOrders((list) =>
        list.map((o) =>
          o.id === id ? { ...o, status: data.order.status, quotedPrice: data.order.quotedPrice } : o,
        ),
      );
      return { ok: true, testimonialLink: data.testimonialLink ?? undefined };
    } catch (e) {
      setOrders(prev);
      setError(e instanceof Error ? e.message : "Gagal menyimpan. Coba lagi.");
      return { ok: false };
    }
  }

  async function moveOrder(o: Order, next: Status, note = "") {
    if (o.status === next || movingId) return;
    setMovingId(o.id);
    const result = await persist(o.id, next, undefined, note || `Dipindah ke ${statusLabel[next]}.`);
    if (result.ok) {
      flash(`${o.code} → ${statusLabel[next]}`);
      if (result.testimonialLink) {
        const fullLink = `${window.location.origin}${result.testimonialLink}`;
        setTestimonialLinkModal(fullLink);
        setTestimonialOrderTarget(o);
      }
    }
    setMovingId(null);
  }

  async function saveDetail() {
    if (!selected) return;
    setSaving(true);
    setError("");
    const price = formPrice === "" ? undefined : Number(formPrice);
    const result = await persist(selected.id, formStatus, price, formNote);
    setSaving(false);
    if (result.ok) {
      flash("Perubahan tersimpan.");
      const currentSelected = selected;
      setSelectedId(null);
      if (result.testimonialLink) {
        const fullLink = `${window.location.origin}${result.testimonialLink}`;
        setTestimonialLinkModal(fullLink);
        setTestimonialOrderTarget(currentSelected);
      }
    }
  }

  async function toggleService(s: ServiceItem, patch: { active?: boolean; featured?: boolean }) {
    const prev = services;
    setServices((list) => list.map((x) => (x.id === s.id ? { ...x, ...patch } : x)));
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      flash("Katalog diperbarui.");
    } catch {
      setServices(prev);
      flash("Gagal menyimpan. Coba lagi.");
    }
  }

  async function toggleTestimonial(t: TestimonialItem) {
    const prev = testimonials;
    setTestimonials((list) =>
      list.map((x) => (x.id === t.id ? { ...x, published: !x.published } : x)),
    );
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !t.published }),
      });
      if (!res.ok) throw new Error();
      flash(t.published ? "Testimoni disembunyikan." : "Testimoni ditayangkan.");
    } catch {
      setTestimonials(prev);
      flash("Gagal menyimpan. Coba lagi.");
    }
  }

  /* Testimonial Form State */
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [tName, setTName] = useState("");
  const [tRole, setTRole] = useState("");
  const [tQuote, setTQuote] = useState("");
  const [tRating, setTRating] = useState(5);
  const [tBusy, setTBusy] = useState(false);
  const [tMsg, setTMsg] = useState("");

  function resetTestimonialForm() {
    setTName("");
    setTRole("");
    setTQuote("");
    setTRating(5);
    setEditingTestimonial(null);
    setShowTestimonialForm(false);
    setTMsg("");
  }

  function startEditTestimonial(t: TestimonialItem) {
    setEditingTestimonial(t);
    setTName(t.name);
    setTRole(t.role);
    setTQuote(t.quote);
    setTRating(t.rating);
    setShowTestimonialForm(true);
    setTMsg("");
  }

  async function saveTestimonial(e: React.FormEvent) {
    e.preventDefault();
    if (tBusy) return;
    setTBusy(true);
    setTMsg("");
    const payload = {
      name: tName.trim(),
      role: tRole.trim(),
      quote: tQuote.trim(),
      rating: Number(tRating) || 5,
    };

    try {
      const url = editingTestimonial
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : "/api/admin/testimonials";
      const method = editingTestimonial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setTMsg(data.error ?? "Gagal menyimpan ulasan.");
        return;
      }
      if (editingTestimonial) {
        setTestimonials((list) =>
          list.map((x) => (x.id === editingTestimonial.id ? { ...x, ...data.testimonial } : x))
        );
        flash("Testimoni berhasil diperbarui.");
      } else {
        setTestimonials((list) => [data.testimonial, ...list]);
        flash("Testimoni berhasil ditambahkan.");
      }
      resetTestimonialForm();
    } catch {
      setTMsg("Terjadi kendala jaringan.");
    } finally {
      setTBusy(false);
    }
  }

  async function regenerateTestimonialToken(orderId: string) {
    if (generatingToken) return;
    setGeneratingToken(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/testimonial-token`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error ?? "Gagal membuat link baru.");
        return;
      }
      const fullLink = `${window.location.origin}${data.testimonialLink}`;
      setTestimonialLinkModal(fullLink);
      flash("Link ulasan berhasil digenerate ulang!");
    } catch {
      flash("Gagal menghubungi server.");
    } finally {
      setGeneratingToken(false);
    }
  }

  async function confirmDeleteTestimonial() {
    if (!deletingTestimonial) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${deletingTestimonial.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTestimonials((list) => list.filter((x) => x.id !== deletingTestimonial.id));
      flash("Testimoni berhasil dihapus.");
    } catch {
      flash("Gagal menghapus testimoni.");
    } finally {
      setDeletingTestimonial(null);
    }
  }

  async function confirmDeleteOrder() {
    if (!deletingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${deletingOrder.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus.");
      }
      setOrders((list) => list.filter((x) => x.id !== deletingOrder.id));
      if (selectedId === deletingOrder.id) {
        setSelectedId(null);
      }
      flash(`Pesanan ${deletingOrder.code} dihapus.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus. Coba lagi.");
    } finally {
      setDeletingOrder(null);
    }
  }

  async function copy(text: string, labelMsg: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(`${labelMsg} tersalin.`);
    } catch {
      setError("Gagal menyalin. Salin manual ya.");
    }
  }

  function exportCsv() {
    const head = "Kode,Judul,Pelanggan,Email,WhatsApp,Layanan,Status,Urgensi,Harga,Deadline,Dibuat";
    const esc = (v: string | number | null) => {
      const s = v === null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = orders.map((o) =>
      [
        o.code,
        o.title,
        o.name,
        o.email,
        o.whatsapp,
        o.service.name,
        statusLabel[o.status],
        o.urgency,
        o.quotedPrice ?? "",
        o.deadline ? formatDateTime(o.deadline) : "",
        formatDateTime(o.createdAt),
      ]
        .map(esc)
        .join(","),
    );
    const blob = new Blob([["﻿" + head, ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-titipit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Laporan diunduh.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function goPesananReview() {
    setStatus("MENUNGGU_REVIEW");
    setListMode("daftar");
    setView("pesanan");
    setNavOpen(false);
  }

  /* ----- static config ----- */
  const menus: { v: View; label: string; icon: typeof House; badge?: number }[] = [
    { v: "dashboard", label: "Dashboard", icon: House },
    { v: "pesanan", label: "Pesanan", icon: ClipboardText, badge: stats.needReview },
    { v: "pelanggan", label: "Pengguna", icon: Users },
    { v: "produk", label: "Produk & Layanan", icon: Cube },
    { v: "portofolio", label: "Portofolio", icon: FolderOpen },
    { v: "whatsapp", label: "WhatsApp", icon: WhatsappLogo },
    { v: "testimoni", label: "Testimoni", icon: Star },
    { v: "laporan", label: "Laporan", icon: ChartBar },
    { v: "pengaturan", label: "Pengaturan", icon: Gear },
  ];

  const statCards = [
    {
      label: "Total Pesanan",
      value: String(stats.total),
      delta: periodDelta(30),
      series: seriesFor(7).total,
      stroke: "#2563eb",
      tile: "bg-blue-50 text-blue-600",
      icon: ClipboardText,
    },
    {
      label: "Pelanggan",
      value: String(customers.length),
      delta: periodDelta(30),
      series: seriesFor(7).total,
      stroke: "#2563eb",
      tile: "bg-blue-50 text-blue-600",
      icon: Users,
    },
    {
      label: "Layanan Aktif",
      value: String(services.filter((s) => s.active).length),
      delta: "0%",
      series: [0, 0, 0, 0, 0, 0, services.filter((s) => s.active).length],
      stroke: "#2563eb",
      tile: "bg-blue-50 text-blue-600",
      icon: Cube,
    },
    {
      label: "Pendapatan (IDR)",
      value: formatRupiah(stats.omzet),
      delta: periodDelta(30),
      series: seriesFor(7).total,
      stroke: "#2563eb",
      tile: "bg-blue-50 text-blue-600",
      icon: Wallet,
    },
  ];

  const serviceUsage = useMemo(() => {
    const rows = services.map((s) => ({
      name: s.name,
      count: orders.filter((o) => o.serviceId === s.id).length,
    }));
    const max = Math.max(...rows.map((r) => r.count), 1);
    return [...rows]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((r) => ({ ...r, pct: Math.round((r.count / max) * 100) }));
  }, [orders, services]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <nav aria-label="Menu admin" className="space-y-1 p-3">
        {menus.map((m) => (
          <button
            key={m.v}
            type="button"
            onClick={() => {
              setView(m.v);
              setNavOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
              view === m.v
                ? "bg-blue-50 font-semibold text-blue-600"
                : "font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <m.icon size={19} aria-hidden /> {m.label}
            {m.badge ? (
              <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-600">
                {m.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <p className="flex items-center justify-between px-1 font-mono text-[11px] text-slate-400">
          <span>titip.it</span>
          <span>v1.0.0</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* ===== Topbar ===== */}
      <header className="sticky top-0 z-40 bg-white/90 shadow-[0_1px_2px_rgba(16,24,40,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 md:gap-4 md:px-6">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                setCollapsed((v) => !v);
              } else {
                setNavOpen(true);
              }
            }}
            aria-label="Buka atau tutup menu"
            className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <ListBullets size={20} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => setView("dashboard")}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Ke dashboard"
          >
            <Image
              src="/logo-mark.png"
              alt=""
              width={44}
              height={35}
              priority
              className="h-7 w-auto"
            />
            <span className="hidden text-[17px] font-semibold tracking-tight text-slate-900 sm:block">
              titip<span className="text-blue-600">.</span>it
            </span>
          </button>
          <form
            className="relative mx-auto w-full max-w-[560px] flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              setView("pesanan");
              setListMode("daftar");
            }}
          >
            <MagnifyingGlass
              size={17}
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kode, judul, nama, WA…"
              aria-label="Cari pesanan"
              className="h-11 w-full rounded-full bg-slate-50 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
            />
            <kbd
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 px-1.5 font-mono text-[11px] text-slate-400 sm:block"
            >
              /
            </kbd>
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2.5">
            <button
              type="button"
              onClick={goPesananReview}
              aria-label={`${stats.needReview} pesanan menunggu review`}
              className="relative grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Bell size={19} aria-hidden />
              {stats.needReview > 0 ? (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-blue-600" aria-hidden />
              ) : null}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenu((v) => !v)}
                aria-expanded={userMenu}
                aria-label="Menu akun"
                className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1 transition hover:bg-slate-100 md:pr-2"
              >
                <span className="grid size-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block text-[13px] font-semibold leading-tight text-slate-900">
                    Admin
                  </span>
                  <span className={`block text-[11px] leading-tight ${muted}`}>Super Admin</span>
                </span>
                <CaretDown size={14} className="hidden text-slate-400 md:block" aria-hidden />
              </button>
              {userMenu ? (
                <>
                  <button
                    type="button"
                    aria-label="Tutup menu akun"
                    onClick={() => setUserMenu(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl bg-white shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3.5">
                      <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                      <p className={`truncate font-mono text-xs ${muted}`}>@{username}</p>
                    </div>
                    <div className="p-2">
                      <a
                        href="/"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100"
                      >
                        <ArrowRight size={15} aria-hidden /> Lihat situs
                      </a>
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100"
                      >
                        <SignOut size={15} weight="bold" aria-hidden /> Keluar
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div
        className={`mx-auto grid w-full max-w-[1440px] gap-5 px-4 py-5 md:px-6 md:py-6 ${collapsed ? "lg:grid-cols-1" : "lg:grid-cols-[248px_minmax(0,1fr)]"}`}
      >
        {/* Sidebar desktop */}
        <aside className={`hidden lg:block ${collapsed ? "lg:hidden" : ""}`}>
          <div className={`sticky top-[84px] overflow-hidden ${card} min-h-[calc(100vh-108px)]`}>
            {sidebar}
          </div>
        </aside>

        {/* Sidebar mobile drawer */}
        {navOpen ? (
          <div role="dialog" aria-modal="true" aria-label="Menu admin">
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setNavOpen(false)}
              className="fixed inset-0 z-[70] cursor-default bg-slate-900/40"
            />
            <div className="fixed inset-y-0 left-0 z-[70] w-[300px] overflow-y-auto bg-white shadow-2xl">
              {sidebar}
            </div>
          </div>
        ) : null}

        {/* ===== Main ===== */}
        <div className="min-w-0">
          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
            >
              {error}
            </p>
          ) : null}

          {view === "dashboard" ? (
            <>
              {/* Header + peta */}
              <div className="relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 right-0 hidden w-[560px] opacity-70 [mask-image:radial-gradient(70%_70%_at_60%_40%,black_20%,transparent_75%)] md:block"
                >
                  <WorldMap arcs={headerArcs} theme="light" lineColor="#2563eb" />
                </div>
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="inline-block rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-600">
                      Selamat Datang di Dashboard
                    </p>
                    <select
                      value={trendRange}
                      onChange={(e) => setTrendRange(Number(e.target.value) as 7 | 30)}
                      aria-label="Rentang tren"
                      className="h-10 rounded-xl bg-white px-3 text-[13px] font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                    >
                      <option value={7}>7 hari terakhir</option>
                      <option value={30}>30 hari terakhir</option>
                    </select>
                  </div>
                  <h1 className="mt-4 max-w-[22ch] text-3xl font-semibold leading-[1.1] tracking-tight text-slate-900 md:text-[40px]">
                    Semua pesanan IT, terpantau rapi dari satu tempat.
                  </h1>
                  <p className={`mt-3 max-w-[52ch] text-[15px] leading-relaxed ${muted}`}>
                    Pantau pesanan, kelola pelanggan, dan atur layanan dengan mudah — semua
                    dari satu tempat.
                  </p>
                </div>
              </div>

              {/* Stat cards */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((c) => (
                  <div key={c.label} className={`${card} p-5`}>
                    <p className="flex items-center gap-2.5 text-[13px] font-medium text-slate-500">
                      <span className={`grid size-9 place-items-center rounded-xl ${c.tile}`}>
                        <c.icon size={18} aria-hidden />
                      </span>
                      {c.label}
                    </p>
                    <p className="mt-3 truncate text-[28px] font-semibold leading-none tracking-tight text-slate-900">
                      {c.value}
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <p className="text-xs font-semibold text-emerald-600">
                        ↑ {c.delta}
                        <span className={`block font-normal ${muted}`}>dari periode lalu</span>
                      </p>
                      <Spark data={c.series} stroke={c.stroke} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0 space-y-4">
                  {/* Tren */}
                  <section className={`${card} p-5 md:p-6`}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="flex items-center gap-2.5 font-semibold text-slate-900">
                        <ChartBar size={18} className="text-blue-600" aria-hidden /> Tren Pesanan
                      </h2>
                      <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
                        {trendRange} hari terakhir
                      </span>
                    </div>
                    <div className="mt-4">
                      <AreaChart labels={trend.labels} values={trend.total} color="#2563eb" />
                    </div>
                  </section>

                  {/* Layanan */}
                  <section className={`${card} p-5 md:p-6`}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="flex items-center gap-2.5 font-semibold text-slate-900">
                        <Cube size={18} className="text-blue-600" aria-hidden /> Layanan Paling
                        Banyak Digunakan
                      </h2>
                      <button
                        type="button"
                        onClick={() => setView("produk")}
                        className="text-[13px] font-semibold text-blue-600 hover:text-blue-500"
                      >
                        Lihat Semua →
                      </button>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {serviceUsage.map((s) => (
                        <div key={s.name} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                          <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                              <Code size={16} aria-hidden />
                            </span>
                            <span className="truncate">{s.name}</span>
                          </p>
                          <p className={`mt-2.5 text-[13px] ${muted}`}>{s.count} pesanan</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-400">{s.pct}%</span>
                            <div
                              className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/70"
                              role="progressbar"
                              aria-valuenow={s.pct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${s.name} ${s.pct} persen`}
                            >
                              <div className="h-full rounded-full bg-blue-600" style={{ width: `${s.pct}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                      {serviceUsage.length === 0 ? (
                        <p className={`text-sm ${muted}`}>Belum ada data layanan.</p>
                      ) : null}
                    </div>
                  </section>
                </div>

                <div className="min-w-0 space-y-4">
                  {/* Pesanan terbaru */}
                  <section className={`${card} p-5`}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="flex items-center gap-2.5 font-semibold text-slate-900">
                        <ListBullets size={18} className="text-blue-600" aria-hidden /> Pesanan
                        Terbaru
                      </h2>
                      <button
                        type="button"
                        onClick={() => setView("pesanan")}
                        className="text-[13px] font-semibold text-blue-600 hover:text-blue-500"
                      >
                        Lihat Semua →
                      </button>
                    </div>
                    <ul className="mt-2 divide-y divide-slate-100">
                      {latest.map((o) => (
                        <li key={o.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(o.id)}
                            className="flex w-full items-center gap-3 rounded-xl py-3.5 text-left transition hover:bg-slate-50"
                          >
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 font-mono text-[11px] font-bold text-blue-600">
                              {o.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-slate-900">
                                {o.name}
                              </span>
                              <span className={`block truncate text-xs ${muted}`}>
                                {o.title}
                              </span>
                            </span>
                            <span className="shrink-0 text-right">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PILL[o.status]}`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${DOT[o.status]}`}
                                  aria-hidden
                                />
                                {o.status === "MENUNGGU_REVIEW"
                                  ? "Menunggu"
                                  : o.status === "SELESAI"
                                    ? "Selesai"
                                    : statusLabel[o.status]}
                              </span>
                              <span className={`mt-1 block text-[11px] ${muted}`}>
                                {timeAgo(o.createdAt)}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                      {latest.length === 0 ? (
                        <li className={`py-8 text-center text-sm ${muted}`}>Belum ada pesanan.</li>
                      ) : null}
                    </ul>
                  </section>

                  {/* Bantuan */}
                  <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-5 text-white">
                    <h2 className="font-semibold">Butuh Bantuan?</h2>
                    <p className="mt-1 text-[13px] text-blue-100">
                      Tim kami siap membantu kapan saja.
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex gap-4 text-xs font-medium text-blue-100">
                        <a href={`mailto:${site.email}`} className="hover:text-white">
                          Email
                        </a>
                        {waChat ? (
                          <a href={waChat} target="_blank" rel="noreferrer" className="hover:text-white">
                            WhatsApp
                          </a>
                        ) : null}
                      </div>
                      {waChat ? (
                        <a
                          href={waChat}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                          Chat Sekarang <ArrowRight size={15} weight="bold" aria-hidden />
                        </a>
                      ) : null}
                    </div>
                  </section>
                </div>
              </div>
            </>
          ) : null}

          {view === "pesanan" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pesanan</h1>
                  <p className={`mt-1 text-sm ${muted}`} aria-live="polite">
                    {visible.length} dari {orders.length} pesanan
                    {status !== "SEMUA" ? ` · ${statusLabel[status as Status]}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    role="tablist"
                    aria-label="Tampilan pesanan"
                    className="flex rounded-xl border border-slate-200 bg-white p-1"
                  >
                    {(
                      [
                        { v: "daftar", label: "Daftar", icon: ListBullets },
                        { v: "kanban", label: "Kanban", icon: Kanban },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.v}
                        type="button"
                        role="tab"
                        aria-selected={listMode === t.v}
                        onClick={() => setListMode(t.v)}
                        className={`flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold transition ${
                          listMode === t.v
                            ? "bg-blue-600 text-white"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <t.icon size={15} weight="bold" aria-hidden /> {t.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => router.refresh()}
                    aria-label="Muat ulang data"
                    className={`${btnGhost} !px-3`}
                  >
                    <ArrowClockwise size={16} weight="bold" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_160px_150px]">
                <label className="relative block">
                  <span className="sr-only">Cari pesanan</span>
                  <MagnifyingGlass
                    size={17}
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari kode, judul, nama, WA…"
                    className={`${field} !pl-11`}
                  />
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  aria-label="Filter status"
                  className={field}
                >
                  <option value="SEMUA">Semua status · {counts.SEMUA ?? 0}</option>
                  {statusOrder.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]} · {counts[s] ?? 0}
                    </option>
                  ))}
                </select>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  aria-label="Filter urgensi"
                  className={field}
                >
                  <option value="SEMUA">Semua urgensi</option>
                  <option value="SANTAI">Santai</option>
                  <option value="NORMAL">Normal</option>
                  <option value="KILAT">Kilat</option>
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "baru" | "lama")}
                  aria-label="Urutkan"
                  className={field}
                >
                  <option value="baru">Terbaru dulu</option>
                  <option value="lama">Terlama dulu</option>
                </select>
              </div>

              {listMode === "daftar" ? (
                <div className={`${card} mt-4 overflow-hidden`}>
                  {visible.length === 0 ? (
                    <p className={`p-10 text-center text-sm ${muted}`}>
                      Tidak ada pesanan yang cocok. Coba ubah kata kunci atau filter.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {visible.map((o) => {
                        const next = NEXT[o.status];
                        return (
                          <li key={o.id} className="p-4 transition hover:bg-slate-50 md:p-5">
                            <button
                              type="button"
                              onClick={() => setSelectedId(o.id)}
                              className="block w-full text-left"
                            >
                              <span className="flex flex-wrap items-center gap-2">
                                <span className={`font-mono text-xs ${muted}`}>{o.code}</span>
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PILL[o.status]}`}
                                >
                                  <span
                                    className={`size-1.5 rounded-full ${DOT[o.status]}`}
                                    aria-hidden
                                  />
                                  {statusLabel[o.status]}
                                </span>
                                {o.urgency === "KILAT" ? (
                                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600">
                                    Kilat
                                  </span>
                                ) : null}
                              </span>
                              <span className="mt-1.5 block truncate font-semibold text-slate-900">
                                {o.title}
                              </span>
                              <span className={`mt-0.5 block truncate text-sm ${muted}`}>
                                {o.name} · {o.service.name} · {formatDateTime(o.createdAt)}
                              </span>
                            </button>
                            <span className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">
                                {o.quotedPrice !== null
                                  ? formatRupiah(o.quotedPrice)
                                  : "Belum ada harga"}
                              </span>
                              <span className="ml-auto flex gap-2">
                                {next ? (
                                  <button
                                    type="button"
                                    disabled={movingId === o.id}
                                    onClick={() => moveOrder(o, next)}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 text-[13px] font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                                  >
                                    {movingId === o.id ? "Memindah…" : `Maju ke ${statusLabel[next]}`}
                                    <ArrowRight size={14} weight="bold" aria-hidden />
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => setSelectedId(o.id)}
                                  className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                  Kelola <CaretRight size={14} weight="bold" aria-hidden />
                                </button>
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : (
                <>
                  <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 xl:grid xl:grid-cols-6 xl:overflow-visible">
                    {kanbanCols.map((col) => (
                      <section
                        key={col.status}
                        aria-label={statusLabel[col.status]}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragId) {
                            const o = orders.find((x) => x.id === dragId);
                            if (o) moveOrder(o, col.status);
                            setDragId(null);
                          }
                        }}
                        className="flex w-[270px] shrink-0 snap-start flex-col rounded-2xl border border-slate-200 bg-slate-100/70 xl:w-auto xl:min-w-0"
                      >
                        <header className="flex items-center gap-2 border-b border-slate-200 p-3.5">
                          <span
                            className={`size-2 rounded-full ${DOT[col.status]}`}
                            aria-hidden
                          />
                          <h2 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-800">
                            {statusLabel[col.status]}
                          </h2>
                          <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-slate-500 shadow-sm">
                            {col.items.length}
                          </span>
                        </header>
                        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-2.5 xl:max-h-[62vh]">
                          {col.items.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
                              Seret kartu ke sini
                            </p>
                          ) : (
                            col.items.map((o) => (
                              <article
                                key={o.id}
                                draggable
                                onDragStart={() => setDragId(o.id)}
                                onDragEnd={() => setDragId(null)}
                                className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition active:cursor-grabbing hover:border-blue-300 ${
                                  dragId === o.id ? "opacity-50" : ""
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedId(o.id)}
                                  className="block w-full text-left"
                                >
                                  <span className={`font-mono text-[11px] ${muted}`}>{o.code}</span>
                                  <span className="mt-1 line-clamp-2 block text-[13px] font-semibold leading-snug text-slate-900">
                                    {o.title}
                                  </span>
                                  <span className={`mt-1 block truncate text-xs ${muted}`}>
                                    {o.name} · {o.service.name}
                                  </span>
                                  <span className="mt-1.5 block text-[13px] font-semibold text-slate-900">
                                    {o.quotedPrice !== null
                                      ? formatRupiah(o.quotedPrice)
                                      : "Belum ada harga"}
                                  </span>
                                </button>
                                <span className="mt-2 flex gap-1">
                                  {(() => {
                                    const idx = statusOrder.indexOf(o.status);
                                    const prevS = statusOrder[idx - 1];
                                    const nextS = statusOrder[idx + 1];
                                    return (
                                      <>
                                        <button
                                          type="button"
                                          aria-label="Geser ke tahap sebelumnya"
                                          disabled={!prevS || movingId === o.id}
                                          onClick={() => prevS && moveOrder(o, prevS)}
                                          className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                                        >
                                          <CaretLeft size={14} weight="bold" />
                                        </button>
                                        <button
                                          type="button"
                                          aria-label="Geser ke tahap berikut"
                                          disabled={!nextS || movingId === o.id}
                                          onClick={() => nextS && moveOrder(o, nextS)}
                                          className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                                        >
                                          <CaretRight size={14} weight="bold" />
                                        </button>
                                      </>
                                    );
                                  })()}
                                </span>
                              </article>
                            ))
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                  <p className={`mt-3 hidden text-xs lg:block ${muted}`}>
                    Tips: seret kartu antar kolom di desktop, atau pakai tombol geser di tiap
                    kartu.
                  </p>
                </>
              )}
            </>
          ) : null}

          {view === "produk" ? (
            <ServiceManager
              services={services}
              setServices={setServices}
              orders={orders}
              flash={flash}
            />
          ) : null}

          {view === "portofolio" ? <PortfolioManager flash={flash} /> : null}

          {view === "pelanggan" ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pengguna</h1>
              <p className={`mt-1 text-sm ${muted}`}>
                {customers.length} pelanggan unik dari {orders.length} pesanan. Klik baris
                untuk melihat pesanannya.
              </p>
              <div className={`${card} mt-4 p-4 md:p-5`}>
                <label className="relative block max-w-md">
                  <span className="sr-only">Cari pelanggan</span>
                  <MagnifyingGlass
                    size={17}
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    placeholder="Cari nama, email, WA…"
                    className={`${field} !pl-11`}
                  />
                </label>
              </div>
              <div className={`${card} mt-4 overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th scope="col" className={th}>Nama</th>
                        <th scope="col" className={th}>Kontak</th>
                        <th scope="col" className={th}>Pesanan</th>
                        <th scope="col" className={th}>Nilai</th>
                        <th scope="col" className={th}>Terakhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr
                          key={c.email}
                          onClick={() => {
                            setQuery(c.email);
                            setStatus("SEMUA");
                            setView("pesanan");
                            setListMode("daftar");
                          }}
                          className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                        >
                          <td className={`${td} font-medium text-slate-900`}>{c.name}</td>
                          <td className={`${td} text-slate-600`}>
                            <span className="block text-[13px]">{c.email}</span>
                            <span className={`font-mono text-xs ${muted}`}>{c.whatsapp}</span>
                          </td>
                          <td className={`${td} text-slate-900`}>{c.count}×</td>
                          <td className={`${td} font-semibold text-slate-900`}>
                            {c.nilai > 0 ? formatRupiah(c.nilai) : "—"}
                          </td>
                          <td className={`${td} whitespace-nowrap ${muted}`}>
                            {formatDateTime(new Date(c.terakhir).toISOString())}
                          </td>
                        </tr>
                      ))}
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className={`px-4 py-10 text-center text-sm ${muted}`}>
                            Tidak ada pelanggan yang cocok.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          {view === "whatsapp" ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">WhatsApp & Gateway Fonnte</h1>
              <p className={`mt-1 text-sm ${muted}`}>
                Kelola nomor kontak WhatsApp yang tampil di situs serta konfigurasi notifikasi gateway Fonnte.
              </p>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <WhatsappManager flash={flash} />
                <FonnteSettings flash={flash} />
              </div>
            </>
          ) : null}

          {view === "testimoni" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Testimoni</h1>
                  <p className={`mt-1 text-sm ${muted}`}>
                    {testimonials.filter((t) => t.published).length} dari {testimonials.length}{" "}
                    tayang di situs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetTestimonialForm();
                    setShowTestimonialForm(true);
                  }}
                  className={btnPrimary}
                >
                  <Plus size={16} weight="bold" aria-hidden /> Tambah Testimoni
                </button>
              </div>

              {showTestimonialForm ? (
                <div className={`${card} mt-4 p-5 md:p-6`}>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingTestimonial ? "Edit Testimoni" : "Tambah Testimoni"}
                  </h2>
                  <form onSubmit={saveTestimonial} className="mt-4 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={label}>Nama Klien *</label>
                        <input
                          type="text"
                          required
                          value={tName}
                          onChange={(e) => setTName(e.target.value)}
                          placeholder="cth. Budi Pratama"
                          className={field}
                        />
                      </div>
                      <div>
                        <label className={label}>Peran / Kampus / Bisnis *</label>
                        <input
                          type="text"
                          required
                          value={tRole}
                          onChange={(e) => setTRole(e.target.value)}
                          placeholder="cth. Teknik Informatika Undip / Owner Kafe"
                          className={field}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={label}>Rating (1 - 5 Bintang)</label>
                      <select
                        value={tRating}
                        onChange={(e) => setTRating(Number(e.target.value))}
                        className={field}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                        <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                        <option value={2}>⭐⭐ (2 Bintang)</option>
                        <option value={1}>⭐ (1 Bintang)</option>
                      </select>
                    </div>

                    <div>
                      <label className={label}>Ulasan / Quote *</label>
                      <textarea
                        required
                        rows={3}
                        value={tQuote}
                        onChange={(e) => setTQuote(e.target.value)}
                        placeholder="Ceritakan pengalaman atau hasil pengerjaan..."
                        className="w-full rounded-xl bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      />
                    </div>

                    {tMsg ? (
                      <p role="alert" className="text-sm font-medium text-red-600">
                        {tMsg}
                      </p>
                    ) : null}

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={resetTestimonialForm}
                        className={btnGhost}
                      >
                        Batal
                      </button>
                      <button type="submit" disabled={tBusy} className={btnPrimary}>
                        {tBusy ? "Menyimpan..." : "Simpan Testimoni"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {testimonials.map((t) => (
                  <figure key={t.id} className={`${card} flex flex-col p-5 md:p-6`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1" aria-label={`${t.rating} dari 5`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={15}
                            weight="fill"
                            aria-hidden
                            className={n <= t.rating ? "text-amber-400" : "text-slate-200"}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditTestimonial(t)}
                          className="rounded-lg p-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTestimonial(t)}
                          className="rounded-lg p-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                    <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <p className={`mt-0.5 text-xs ${muted}`}>{t.role}</p>
                    </figcaption>
                    <button
                      type="button"
                      onClick={() => toggleTestimonial(t)}
                      aria-pressed={t.published}
                      className={`mt-4 inline-flex h-9 items-center justify-center rounded-xl border text-[13px] font-semibold transition ${
                        t.published
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {t.published ? "Tayang — klik untuk sembunyikan" : "Tayangkan"}
                    </button>
                  </figure>
                ))}
                {testimonials.length === 0 ? (
                  <p className={`${card} p-10 text-center text-sm ${muted} md:col-span-2`}>
                    Belum ada testimoni.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          {view === "laporan" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Laporan</h1>
                  <p className={`mt-1 text-sm ${muted}`}>
                    Ringkasan kinerja dari data pesanan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={reportRange}
                    onChange={(e) => setReportRange(Number(e.target.value) as 7 | 30)}
                    aria-label="Rentang laporan"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value={7}>7 hari terakhir</option>
                    <option value={30}>30 hari terakhir</option>
                  </select>
                  <button type="button" onClick={exportCsv} className={btnPrimary}>
                    <DownloadSimple size={16} weight="bold" aria-hidden /> CSV
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
                {[
                  { label: "Omzet disepakati", value: formatRupiah(report.omzet) },
                  { label: "Rata-rata harga", value: formatRupiah(report.avg) },
                  { label: "Pesanan kilat", value: String(report.kilat) },
                  { label: "Dibatalkan", value: String(report.batal) },
                ].map((t) => (
                  <div key={t.label} className={`${card} p-5`}>
                    <p className={`text-xs font-medium ${muted}`}>{t.label}</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                      {t.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className={`${card} mt-4 p-5`}>
                <h2 className="font-semibold text-slate-900">Pesanan per hari</h2>
                <div className="mt-4">
                  <AreaChart labels={report.labels} values={report.values} color="#2563eb" />
                </div>
              </div>
              <div className={`${card} mt-4 overflow-hidden`}>
                <h2 className="p-5 pb-3 font-semibold text-slate-900 md:px-6">Per layanan</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse">
                    <thead>
                      <tr className="border-y border-slate-100">
                        <th scope="col" className={th}>Layanan</th>
                        <th scope="col" className={th}>Pesanan</th>
                        <th scope="col" className={th}>Omzet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.perService.map((s) => (
                        <tr key={s.name} className="border-b border-slate-100 last:border-0">
                          <td className={`${td} font-medium text-slate-900`}>{s.name}</td>
                          <td className={`${td} text-slate-600`}>{s.count}</td>
                          <td className={`${td} font-semibold text-slate-900`}>
                            {s.omzet > 0 ? formatRupiah(s.omzet) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          {view === "pengaturan" ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pengaturan</h1>
              <p className={`mt-1 text-sm ${muted}`}>Akun dan sesi perangkat ini.</p>

              <div className={`${card} mt-4 max-w-[560px] p-5 md:p-6`}>
                <h2 className="font-semibold text-slate-900">Profil Operator</h2>
                <p className="mt-4 flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-blue-600 text-base font-bold text-white">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-900">{name}</span>
                    <span className={`block font-mono text-xs ${muted}`}>@{username}</span>
                  </span>
                </p>
                <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className={muted}>Peran</dt>
                    <dd className="font-medium text-slate-900">Super Admin</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className={muted}>Sesi</dt>
                    <dd className="font-medium text-slate-900">8 jam per perangkat</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className={muted}>Versi panel</dt>
                    <dd className="font-mono text-slate-900">v1.0.0</dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-wrap gap-2">
                  <a href="/" className={btnGhost}>
                    Lihat situs <ArrowRight size={15} aria-hidden />
                  </a>
                  <button type="button" onClick={logout} className={btnPrimary}>
                    <SignOut size={16} weight="bold" aria-hidden /> Keluar
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* ===== Detail drawer ===== */}
      {selected ? (
        <div role="dialog" aria-modal="true" aria-label={`Kelola ${selected.code}`}>
          <button
            type="button"
            aria-label="Tutup detail"
            onClick={() => setSelectedId(null)}
            className="fixed inset-0 z-[70] cursor-default bg-slate-900/40"
          />
          <div className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[560px] flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 md:p-6">
              <div className="min-w-0">
                <p className={`font-mono text-xs tracking-[0.12em] ${muted}`}>
                  {selected.code} · {formatDateTime(selected.createdAt)}
                </p>
                <h2 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-slate-900">
                  {selected.title}
                </h2>
                <p className={`mt-1 text-sm ${muted}`}>
                  {selected.name} · {selected.service.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Tutup"
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X size={17} weight="bold" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              <ol aria-label="Tahapan proses" className="flex flex-wrap gap-1.5">
                {statusOrder
                  .filter((s) => s !== "DIBATALKAN")
                  .map((s, i, arr) => {
                    const reached =
                      (arr as Status[]).indexOf(selected.status) >= i ||
                      selected.status === "SELESAI";
                    const current = selected.status === s;
                    return (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => setFormStatus(s)}
                          title={`Set ke ${statusLabel[s]}`}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            current
                              ? "border-blue-600 bg-blue-600 text-white"
                              : reached
                                ? "border-blue-200 bg-blue-50 text-slate-900"
                                : "border-slate-200 text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          {i + 1}. {statusLabel[s]}
                        </button>
                      </li>
                    );
                  })}
              </ol>
              <button
                type="button"
                onClick={() => setFormStatus("DIBATALKAN")}
                className={`mt-2 text-xs font-semibold underline-offset-2 hover:underline ${
                  formStatus === "DIBATALKAN" ? "text-red-500" : "text-slate-400"
                }`}
              >
                {formStatus === "DIBATALKAN" ? "✓ Akan dibatalkan saat disimpan" : "Batalkan pesanan…"}
              </button>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                {[
                  { k: "Urgensi", v: selected.urgency },
                  { k: "Deadline", v: selected.deadline ? formatDateTime(selected.deadline) : "Fleksibel" },
                  {
                    k: "Budget klien",
                    v:
                      selected.budgetMin !== null || selected.budgetMax !== null
                        ? `${selected.budgetMin !== null ? formatRupiah(selected.budgetMin) : "?"} – ${selected.budgetMax !== null ? formatRupiah(selected.budgetMax) : "?"}`
                        : "Tidak diisi",
                  },
                  {
                    k: "Harga fix",
                    v: selected.quotedPrice !== null ? formatRupiah(selected.quotedPrice) : "Belum ada",
                  },
                ].map((m) => (
                  <div key={m.k} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className={`text-xs ${muted}`}>{m.k}</p>
                    <p className="mt-1 font-semibold text-slate-900">{m.v}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                {selected.brief}
              </p>

              {selected.attachmentUrl ? (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-blue-50/70 p-3.5 text-xs text-blue-900">
                  <span className="font-medium">📎 Lampiran Dokumen/Brief Klien</span>
                  <a
                    href={selected.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white transition hover:bg-blue-500"
                  >
                    Buka / Unduh File
                  </a>
                </div>
              ) : null}

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <a
                  href={`https://wa.me/${waNumber(selected.whatsapp)}?text=${encodeURIComponent(`Halo ${selected.name}, saya operator titip.it soal pesanan ${selected.code} (${selected.title}). `)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={btnGhost}
                >
                  <WhatsappLogo size={16} aria-hidden /> Chat WA
                </a>
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Pesanan ${selected.code} — ${selected.title}`)}`}
                  className={btnGhost}
                >
                  <EnvelopeSimple size={16} aria-hidden /> Email
                </a>
                <button
                  type="button"
                  onClick={() => copy(selected.whatsapp, "Nomor WA")}
                  className={btnGhost}
                >
                  <Copy size={15} aria-hidden /> Salin WA
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Link Ulasan / Testimoni</p>
                  <p className={`text-[11px] ${muted}`}>Generate token baru untuk dikirim ke klien</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTestimonialOrderTarget(selected);
                    regenerateTestimonialToken(selected.id);
                  }}
                  disabled={generatingToken}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                >
                  <ArrowClockwise size={13} className={generatingToken ? "animate-spin" : ""} />
                  {generatingToken ? "Membuat..." : "Buat / Reset Link"}
                </button>
              </div>
              <p className={`mt-2 text-xs ${muted}`}>
                {selected.email} · {selected.whatsapp}
                {selected.campus ? ` · ${selected.campus}` : ""}
              </p>

              <h3 className="mt-6 text-sm font-semibold text-slate-900">Riwayat</h3>
              <ol className="mt-3 space-y-3">
                {selected.events.length === 0 ? (
                  <li className={`text-sm ${muted}`}>
                    Belum ada riwayat. Update pertama akan tercatat di sini.
                  </li>
                ) : (
                  selected.events.map((ev, i) => (
                    <li key={`${ev.createdAt}-${i}`} className="flex gap-3 text-sm">
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${DOT[ev.status] ?? "bg-slate-300"}`}
                        aria-hidden
                      />
                      <span>
                        <span className="font-semibold text-slate-900">
                          {statusLabel[ev.status as Status] ?? ev.status}
                        </span>{" "}
                        <span className={`font-mono text-xs ${muted}`}>
                          · {formatDateTime(ev.createdAt)}
                        </span>
                        <span className={`mt-0.5 block leading-relaxed ${muted}`}>{ev.note}</span>
                      </span>
                    </li>
                  ))
                )}
              </ol>

              <h3 className="mt-6 text-sm font-semibold text-slate-900">Update pesanan</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="admin-status" className={label}>
                    Status
                  </label>
                  <select
                    id="admin-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Status)}
                    className={field}
                  >
                    {statusOrder.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="admin-price" className={label}>
                    Harga fix (Rp)
                  </label>
                  <input
                    id="admin-price"
                    inputMode="numeric"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="cth: 750000"
                    className={field}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label htmlFor="admin-note" className={label}>
                  Catatan untuk klien
                </label>
                <textarea
                  id="admin-note"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="cth: Harga disepakati, menunggu pembayaran."
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-slate-100 p-4 md:p-5">
              <button
                type="button"
                onClick={() => selected && setDeletingOrder(selected)}
                className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                aria-label="Hapus pesanan"
                title="Hapus pesanan"
              >
                <Trash size={17} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className={`${btnGhost} flex-1`}
              >
                Batal
              </button>
              <button type="button" onClick={saveDetail} disabled={saving} className={`${btnPrimary} flex-[2]`}>
                {saving ? "Menyimpan…" : "Simpan update"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={Boolean(deletingOrder)}
        title="Hapus Pesanan"
        description={`Hapus pesanan ${deletingOrder?.code} (${deletingOrder?.title})?\nData pesanan dan seluruh riwayatnya akan dihapus permanen.`}
        confirmText="Hapus Pesanan"
        onConfirmAction={confirmDeleteOrder}
        onCancelAction={() => setDeletingOrder(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingTestimonial)}
        title="Hapus Testimoni"
        description={`Hapus testimoni dari "${deletingTestimonial?.name}"?\nUlasan ini tidak akan tampil lagi di situs.`}
        confirmText="Hapus Testimoni"
        onConfirmAction={confirmDeleteTestimonial}
        onCancelAction={() => setDeletingTestimonial(null)}
      />

      {/* Testimonial link modal */}
      {testimonialLinkModal ? (
        <div role="dialog" aria-modal="true" aria-label="Link testimoni">
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => setTestimonialLinkModal(null)}
            className="fixed inset-0 z-[80] cursor-default bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="fixed left-1/2 top-1/2 z-[80] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Link Testimoni (Sekali Pakai)</h3>
                <p className={`mt-1.5 text-sm ${muted}`}>
                  Kirim link ini ke pelanggan untuk mengisi ulasan. Link hanya bisa dipakai 1× dan berlaku 30 hari.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTestimonialLinkModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                readOnly
                value={testimonialLinkModal}
                className="h-11 flex-1 rounded-xl bg-slate-50 px-3 font-mono text-sm text-slate-900 focus:outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(testimonialLinkModal);
                  flash("Link tersalin!");
                }}
                className={btnPrimary}
              >
                <Copy size={16} aria-hidden /> Salin
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              {testimonialOrderTarget ? (
                <button
                  type="button"
                  disabled={generatingToken}
                  onClick={() => regenerateTestimonialToken(testimonialOrderTarget.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <ArrowClockwise size={13} className={generatingToken ? "animate-spin" : ""} />
                  {generatingToken ? "Mengenerate..." : "Generate Ulang"}
                </button>
              ) : <span />}
              <button
                type="button"
                onClick={() => setTestimonialLinkModal(null)}
                className={btnGhost}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Toast */}
      {toast ? (
        <p
          role="status"
          className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl"
        >
          {toast}
        </p>
      ) : null}
    </div>
  );
}
