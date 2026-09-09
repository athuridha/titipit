"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { urgencyLabel } from "@/lib/status";
import { formatRupiah } from "@/lib/format";

type Service = {
  id: string;
  slug: string;
  name: string;
  priceFrom: number | null;
  turnaround: string;
};

const inputClass =
  "h-12 w-full rounded-field border border-line bg-bg-elevated px-4 text-[0.9375rem] text-ink placeholder:text-muted/70 transition-colors focus:border-accent-hairline focus:outline-none";
const areaClass =
  "min-h-[140px] w-full rounded-field border border-line bg-bg-elevated px-4 py-3 text-[0.9375rem] leading-relaxed text-ink placeholder:text-muted/70 transition-colors focus:border-accent-hairline focus:outline-none";
const labelClass = "mb-2 block text-sm font-semibold text-ink";
const hintClass = "mt-1.5 text-xs leading-relaxed text-muted";
const errorClass = "mt-1.5 text-xs font-medium text-danger";

function OrderForm() {
  const params = useSearchParams();
  const preselect = params.get("layanan") ?? "";

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState<{ code: string; service: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    campus: "",
    serviceSlug: preselect,
    title: "",
    brief: "",
    attachmentUrl: "",
    urgency: "NORMAL",
    deadline: "",
    budgetMin: "",
    budgetMax: "",
  });
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        if (alive) setServices(data.services ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoadingServices(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (preselect) setForm((f) => ({ ...f, serviceSlug: preselect }));
  }, [preselect]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFields({});
    setFormError("");

    const service = services.find((s) => s.slug === form.serviceSlug);

    const payload = {
      name: form.name,
      email: form.email,
      whatsapp: form.whatsapp,
      campus: form.campus,
      serviceId: service?.id ?? "",
      title: form.title,
      brief: form.brief,
      attachmentUrl: form.attachmentUrl || undefined,
      urgency: form.urgency,
      deadline: form.deadline || undefined,
      budgetMin: form.budgetMin === "" ? undefined : Number(form.budgetMin),
      budgetMax: form.budgetMax === "" ? undefined : Number(form.budgetMax),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFields(data.fields ?? {});
        setFormError(data.error ?? "Ada yang belum benar. Periksa lagi.");
        return;
      }
      setDone({ code: data.code, service: data.service });
    } catch {
      setFormError("Jaringan bermasalah. Coba lagi atau hubungi WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center md:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-pill bg-accent-soft text-accent-text">
          <CheckCircle size={28} weight="fill" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">
          Brief diterima. Simpan kode ini.
        </h1>
        <p className="mx-auto mt-3 max-w-[52ch] text-sm leading-relaxed text-muted">
          Pesanan {done.service} masuk antrean review. Balasan maksimal 6 jam pada jam kerja. Lacak progres dengan kode di bawah.
        </p>
        <p className="mx-auto mt-6 w-fit rounded-pill border border-accent-hairline bg-accent-soft px-6 py-3 font-mono text-lg font-semibold tracking-[0.12em] text-ink">
          {done.code}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/lacak?kode=${done.code}`}
            className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-pill bg-accent px-5 text-[0.9375rem] font-semibold text-accent-ink transition-[transform,background-color] duration-200 hover:brightness-[1.08] active:translate-y-[1px]"
          >
            Cek pesanan <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-pill border border-line-strong bg-surface px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-accent-hairline"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-card border border-line bg-surface p-6 md:p-10">
      {formError ? (
        <p role="alert" className="mb-6 rounded-field border border-danger/40 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="layanan" className={labelClass}>Layanan</label>
          <select
            id="layanan"
            value={form.serviceSlug}
            onChange={(e) => set("serviceSlug", e.target.value)}
            className={inputClass}
            aria-invalid={Boolean(fields.serviceId)}
          >
            <option value="">{loadingServices ? "Memuat layanan…" : "Pilih layanan"}</option>
            {services.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name} — {s.priceFrom === null ? "hubungi kami" : `dari ${formatRupiah(s.priceFrom)}`}
              </option>
            ))}
          </select>
          {fields.serviceId ? <p className={errorClass}>{fields.serviceId}</p> : null}
        </div>
        <div>
          <label htmlFor="urgency" className={labelClass}>Kecepatan</label>
          <select id="urgency" value={form.urgency} onChange={(e) => set("urgency", e.target.value)} className={inputClass}>
            {(Object.keys(urgencyLabel) as Array<keyof typeof urgencyLabel>).map((k) => (
              <option key={k} value={k}>{urgencyLabel[k]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="title" className={labelClass}>Judul pekerjaan</label>
        <input
          id="title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="cth: Sistem kasir untuk kedai kopi"
          className={inputClass}
          maxLength={140}
          aria-invalid={Boolean(fields.title)}
        />
        {fields.title ? <p className={errorClass}>{fields.title}</p> : <p className={hintClass}>Minimal 6 karakter, spesifik lebih baik.</p>}
      </div>

      <div className="mt-6">
        <label htmlFor="brief" className={labelClass}>Brief</label>
        <textarea
          id="brief"
          value={form.brief}
          onChange={(e) => set("brief", e.target.value)}
          placeholder="Ceritakan: kebutuhan, fitur, referensi, format pengumpulan, hal yang tidak boleh dilakukan…"
          className={areaClass}
          maxLength={4000}
          aria-invalid={Boolean(fields.brief)}
        />
        {fields.brief ? <p className={errorClass}>{fields.brief}</p> : <p className={hintClass}>Minimal 30 karakter. Makin detail, estimasi makin akurat.</p>}

        {/* Upload Dokumen/File Pendukung ke Cloudflare R2 */}
        <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-2/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-ink">Lampiran Brief (PDF / Gambar) - Opsional</p>
              <p className="text-[11px] text-muted">Upload file soal tugas, modul, dokumen spesifikasi PDF, atau sketsa gambar (Maks. 25MB).</p>
            </div>
            <div>
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,.rar"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingFile(true);
                  setUploadError("");
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("folder", "briefs");
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Gagal mengunggah file.");
                    set("attachmentUrl", data.url);
                    setUploadedFileName(file.name);
                  } catch (err: any) {
                    setUploadError(err.message || "Gagal mengunggah file.");
                  } finally {
                    setUploadingFile(false);
                  }
                }}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-pill bg-surface px-4 text-xs font-semibold text-ink shadow-sm transition hover:bg-surface-2 border border-line"
              >
                {uploadingFile ? "Mengunggah…" : form.attachmentUrl ? "Ganti File" : "Pilih File"}
              </label>
            </div>
          </div>
          {form.attachmentUrl ? (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              ✓ Berhasil terlampir: {uploadedFileName || "File dokumen brief"}
            </p>
          ) : null}
          {uploadError ? <p className="mt-2 text-xs text-danger">{uploadError}</p> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="name" className={labelClass}>Nama</label>
          <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nama kamu" autoComplete="name" className={inputClass} aria-invalid={Boolean(fields.name)} />
          {fields.name ? <p className={errorClass}>{fields.name}</p> : null}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama@email.com" autoComplete="email" className={inputClass} aria-invalid={Boolean(fields.email)} />
          {fields.email ? <p className={errorClass}>{fields.email}</p> : null}
        </div>
        <div>
          <label htmlFor="whatsapp" className={labelClass}>WhatsApp</label>
          <input id="whatsapp" inputMode="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="081234567890" autoComplete="tel" className={inputClass} aria-invalid={Boolean(fields.whatsapp)} />
          {fields.whatsapp ? <p className={errorClass}>{fields.whatsapp}</p> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="campus" className={labelClass}>Kampus / instansi <span className="font-normal text-muted">(opsional)</span></label>
          <input id="campus" value={form.campus} onChange={(e) => set("campus", e.target.value)} placeholder="cth: Undip" className={inputClass} />
        </div>
        <div>
          <label htmlFor="deadline" className={labelClass}>Deadline <span className="font-normal text-muted">(opsional)</span></label>
          <input id="deadline" type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className={inputClass} />
          {fields.deadline ? <p className={errorClass}>{fields.deadline}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="budgetMin" className={labelClass}>Budget min</label>
            <input id="budgetMin" inputMode="numeric" value={form.budgetMin} onChange={(e) => set("budgetMin", e.target.value)} placeholder="50000" className={inputClass} />
          </div>
          <div>
            <label htmlFor="budgetMax" className={labelClass}>Budget maks</label>
            <input id="budgetMax" inputMode="numeric" value={form.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} placeholder="500000" className={inputClass} />
          </div>
        </div>
      </div>
      {fields.budgetMax ? <p className={errorClass}>{fields.budgetMax}</p> : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[44ch] text-xs leading-relaxed text-muted">
          Dengan menekan tombol, kamu setuju dihubungi lewat WhatsApp dan email untuk keperluan pesanan ini. Identitas tidak dibagikan ke pihak lain.
        </p>
        <Button type="submit" size="lg" disabled={submitting} className="shrink-0">
          {submitting ? "Mengirim…" : "Kirim brief"}
          <ArrowRight size={17} weight="bold" aria-hidden />
        </Button>
      </div>
    </form>
  );
}

export default function PesanPage() {
  const [waText, setWaText] = useState("WhatsApp operator");
  useEffect(() => {
    fetch("/api/contact")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const first = data?.numbers?.[0];
        if (first) setWaText(`WhatsApp ${first.label} ${first.number}`);
      })
      .catch(() => {});
  }, []);
  return (
    <Container className="max-w-[880px] py-12 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-text">Pesan</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tighter md:text-5xl">
        Ceritakan kerjaanmu dalam 3 menit.
      </h1>
      <p className="mt-4 max-w-[60ch] leading-relaxed text-muted">
        Makin lengkap brief, makin cepat review. Butuh patokan? Lihat{" "}
        <Link href="/#harga" className="font-semibold text-ink underline decoration-accent-hairline underline-offset-4">aturan harga</Link>{" "}
        atau tanya via {waText}.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="rounded-card border border-line bg-surface p-10 text-sm text-muted">Memuat formulir…</div>}>
          <OrderForm />
        </Suspense>
      </div>
    </Container>
  );
}
