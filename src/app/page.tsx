import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChatCircleText,
  CheckCircle,
  Clock,
  Code,
  Cpu,
  Database,
  FileText,
  HardDrives,
  Headset,
  Invoice,
  Laptop,
  MagnifyingGlass,
  Package,
  Robot,
  ShieldCheck,
  Star,
  TerminalWindow,
  Truck,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { categoryLabel } from "@/lib/status";
import { formatPriceShort, formatRupiah } from "@/lib/format";
import { cta, site, whatsappLink } from "@/lib/site";
import { getWhatsappNumbers } from "@/lib/whatsapp";
import { Container, Eyebrow } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { WorldMap, type MapArc } from "@/components/world-map";
import { Reveal } from "@/components/ui/reveal";

export const revalidate = 300;

/** Koneksi hero: Indonesia sebagai pusat pengerjaan IT standar global. */
const heroArcs: MapArc[] = [
  {
    start: { lat: -6.2, lng: 106.85 },
    end: { lat: 35.68, lng: 139.69 },
  },
  {
    start: { lat: -6.2, lng: 106.85 },
    end: { lat: -33.87, lng: 151.21 },
  },
  {
    start: { lat: -6.2, lng: 106.85 },
    end: { lat: 52.52, lng: 13.4 },
  },
  {
    start: { lat: -6.2, lng: 106.85 },
    end: { lat: 37.77, lng: -122.42 },
  },
  {
    start: { lat: -6.2, lng: 106.85 },
    end: { lat: 40.71, lng: -74.0 },
  },
  {
    start: { lat: -6.2, lng: 106.85 },
    end: { lat: 51.5, lng: -0.12 },
  },
  {
    start: { lat: 3.6, lng: 98.67 },
    end: { lat: 25.2, lng: 55.27 },
  },
  {
    start: { lat: -7.25, lng: 112.75 },
    end: { lat: 1.35, lng: 103.82 },
  },
];

const steps = [
  {
    icon: ChatCircleText,
    title: "Kirim brief kebutuhan",
    body: "Isi formulir pesan dalam 3 menit. Ceritakan spesifikasi tugas, deadline, dan target hasil.",
  },
  {
    icon: MagnifyingGlass,
    title: "Review teknis 6 jam",
    body: "Brief dicek langsung oleh tim teknis pada jam kerja. Kamu menerima rincian harga fix dan timeline.",
  },
  {
    icon: Package,
    title: "Pengerjaan per milestone",
    body: "Dikerjakan bertahap dan terpantau berkala lewat kode pesanan di halaman lacak.",
  },
  {
    icon: Truck,
    title: "Walkthrough & serah terima",
    body: "File sumber diserahkan utuh, dilengkapi sesi penjelasan 30 menit agar kamu menguasai alurnya.",
  },
] as const;

export default async function HomePage() {
  const [services, testimonials, faqs, waNumbers] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 20,
    }),
    prisma.faq.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    getWhatsappNumbers(),
  ]);

  const waPrimary = waNumbers[0]?.number;
  const marquee = [...services, ...services];

  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);
  const repeat = testimonials.length <= 4 ? 4 : 2;
  const marqueeRow1 = Array.from({ length: repeat }).flatMap(() => row1);
  const marqueeRow2 = Array.from({ length: repeat }).flatMap(() => row2);

  const serviceIcons: Record<string, typeof Code> = {
    "tugas-praktikum-it": Code,
    "skripsi-tugas-akhir": Laptop,
    "web-aplikasi": TerminalWindow,
    "bot-automasi": Robot,
    "ui-ux-aset-visual": FileText,
    "analisis-data": Database,
    "server-deploy-jaringan": HardDrives,
  };

  return (
    <div className="overflow-x-hidden w-full max-w-full">
      {/* HERO SECTION: WorldMap Animated Backdrop with High-Impact Content */}
      <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-32">
        {/* Ambient Top Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(65%_55%_at_50%_0%,var(--accent-soft)_0%,transparent_75%)]"
        />

        {/* World Map Backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-4 flex justify-center [mask-image:radial-gradient(75%_75%_at_50%_40%,black_30%,transparent_85%)] opacity-75"
        >
          <WorldMap arcs={heroArcs} className="w-[min(1180px,220vw)] shrink-0" />
        </div>

        {/* Bottom Transition Scrim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[var(--bg)]"
        />

        <Container className="relative z-10 text-center">
          <Reveal className="mx-auto flex flex-col items-center">
            <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface/90 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft shadow-sm backdrop-blur">
              <span className="size-2 rounded-full bg-accent animate-pulse" aria-hidden />
              Solusi Lengkap Kebutuhan IT Kamu
            </span>

            <h1 className="mt-7 max-w-5xl text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Semua urusan IT kamu, selesai rapi dan kamu tetap paham alurnya.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Tugas pemrograman, skripsi sistem informasi, pembuatan website, bot automasi, hingga setup server. Dikerjakan terarah oleh praktisi dengan penyerahan kode sumber utuh dan sesi penjelasan langsung.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href={cta.order.href} size="lg">
                {cta.order.label}
                <ArrowRight size={17} weight="bold" aria-hidden />
              </ButtonLink>
              <ButtonLink
                href={whatsappLink("Halo titip.it, saya ingin konsultasi kebutuhan IT saya.", waPrimary)}
                size="lg"
                variant="secondary"
              >
                <WhatsappLogo size={18} weight="bold" className="text-accent-text" aria-hidden />
                Konsultasi WhatsApp gratis
              </ButtonLink>
              <ButtonLink href={cta.track.href} size="lg" variant="ghost">
                {cta.track.label}
              </ButtonLink>
            </div>

            <ul className="mx-auto mt-9 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-2.5 text-xs sm:text-sm text-ink-soft">
              <li className="inline-flex items-center gap-2">
                <ShieldCheck size={16} weight="bold" className="text-accent-text" aria-hidden />
                Harga fix setelah review
              </li>
              <li className="inline-flex items-center gap-2">
                <MagnifyingGlass size={16} weight="bold" className="text-accent-text" aria-hidden />
                Progres terpantau di halaman lacak
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle size={16} weight="bold" className="text-accent-text" aria-hidden />
                File sumber + sesi 30 menit
              </li>
            </ul>
          </Reveal>
        </Container>
      </section>

      {/* INFINITE MARQUEE TICKER */}
      <section aria-label="Ringkasan kapabilitas" className="border-y border-line bg-bg-elevated">
        <div className="marquee-mask overflow-hidden py-4">
          <div className="marquee-track flex w-max items-center gap-8 pr-8">
            {marquee.map((s, i) => (
              <span
                key={`${s.id}-${i}`}
                aria-hidden={i >= services.length}
                className="flex items-center gap-8 whitespace-nowrap text-sm font-medium tracking-wide text-ink-soft"
              >
                {s.name}
                <span className="text-accent-text" aria-hidden>•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* GAPLESS BENTO GRID: 12-COLUMNS MATHEMATICALLY INTERLOCKING */}
      <section id="layanan" className="scroll-mt-24 py-20 md:py-32">
        <Container>
          <Reveal>
            <Eyebrow>Katalog Layanan</Eyebrow>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
              Tujuh bidang keahlian, satu standar serah terima.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              Pilih kebutuhan yang sedang kamu hadapi. Semua layanan menyertakan penyerahan file sumber utuh dan sesi penjelasan langsung agar kamu benar-benar menguasainya.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-flow-dense gap-5 sm:grid-cols-2 lg:grid-cols-12">
            {services.map((s, i) => {
              const IconComponent = serviceIcons[s.slug] || Code;

              // 12-col bento distribution:
              // Card 1: 7 cols
              // Card 2: 5 cols
              // Card 3: 6 cols
              // Card 4: 6 cols
              // Card 5: 4 cols
              // Card 6: 4 cols
              // Card 7: 4 cols
              const spanClass =
                i === 0
                  ? "lg:col-span-7"
                  : i === 1
                  ? "lg:col-span-5"
                  : i === 2
                  ? "lg:col-span-6"
                  : i === 3
                  ? "lg:col-span-6"
                  : "lg:col-span-4";

              return (
                <Reveal
                  as="article"
                  key={s.id}
                  delay={Math.min(i * 0.05, 0.2)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-card border border-line bg-surface p-6 sm:p-7 transition-all duration-300 hover:border-line-strong hover:shadow-lg ${spanClass}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-12 place-items-center rounded-pill bg-accent-soft text-accent-text transition-transform duration-300 group-hover:scale-110">
                        <IconComponent size={24} weight="bold" aria-hidden />
                      </span>
                      <span className="rounded-pill border border-line bg-surface-2 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                        {categoryLabel[s.category]}
                      </span>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-xl font-semibold tracking-tight text-ink group-hover:text-accent-text transition-colors">
                        {s.name}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-accent-text">{s.tagline}</p>
                      <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
                    </div>

                    <div className="mt-6 border-t border-line/80 pt-4">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Termasuk:</p>
                      <ul className="mt-2.5 space-y-2">
                        {s.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-2.5 text-xs text-ink-soft">
                            <CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-accent-text" aria-hidden />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase text-muted">Biaya mulai</p>
                      <p className="font-mono text-base font-semibold text-ink">
                        {formatRupiah(s.priceFrom)}
                      </p>
                      <p className="font-mono text-[11px] text-muted">{s.turnaround}</p>
                    </div>

                    <Link
                      href={`/pesan?layanan=${s.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong bg-surface-2 px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-accent-hairline hover:bg-accent hover:text-accent-ink"
                    >
                      Pesan ini
                      <ArrowUpRight size={14} weight="bold" aria-hidden />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CARA KERJA: 4 TAHAP TRANSPARANSI */}
      <section id="cara-kerja" className="scroll-mt-24 border-t border-line bg-bg-elevated py-20 md:py-32">
        <Container>
          <Reveal className="max-w-3xl">
            <Eyebrow>Alur Pengerjaan</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
              Dari brief sampai serah terima tanpa drama.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Alur pengerjaan terstruktur agar kamu tidak perlu menebak-nebak progres. Status pengerjaan bisa dicek langsung kapan saja lewat fitur lacak pesanan.
            </p>
          </Reveal>

          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.06} className="flex flex-col justify-between rounded-card border border-line bg-surface p-6 sm:p-7">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-pill bg-accent-soft text-accent-text">
                      <step.icon size={22} weight="bold" aria-hidden />
                    </span>
                    <span className="font-mono text-sm font-semibold text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>

                <div className="mt-6 border-t border-line pt-3 font-mono text-[11px] text-accent-text">
                  Tahap 0{i + 1} Terjamin
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* HARGA & ATURAN MAIN: Transparansi Tanpa Biaya Tersembunyi */}
      <section id="harga" className="scroll-mt-24 py-20 md:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 items-center">
            <Reveal>
              <Eyebrow>Transparansi Biaya</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
                Harga jelas di awal, revisi termasuk.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted">
                Angka di katalog adalah patokan mulai. Setelah brief direview tim teknis, kamu menerima rincian fix tanpa biaya siluman.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-accent-text" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-ink">Dua putaran revisi gratis</p>
                    <p className="text-xs text-muted">Perbaikan dalam lingkup brief awal tidak dikenakan biaya tambahan.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-accent-text" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-ink">Jaminan kerahasiaan penuh (NDA)</p>
                    <p className="text-xs text-muted">Identitas dan isi tugas/proyek kamu tidak akan dipublikasikan ke pihak mana pun.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={cta.order.href} size="lg">{cta.order.label}</ButtonLink>
                <ButtonLink href={cta.track.href} size="lg" variant="secondary">{cta.track.label}</ButtonLink>
              </div>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                {
                  icon: Invoice,
                  title: "Di bawah 500 rb",
                  sub: "Bayar di awal",
                  body: "Langsung masuk antrean prioritas pengerjaan setelah brief disetujui.",
                },
                {
                  icon: FileText,
                  title: "Di atas 500 rb",
                  sub: "Dua termin (50:50)",
                  body: "50% tanda jadi di awal, dan sisa 50% dilunasi saat serah terima hasil.",
                },
                {
                  icon: Clock,
                  title: "Opsi kilat",
                  sub: "Prioritas 24-48 jam",
                  body: "Deadline mendesak? Tambah 40% untuk pengerjaan dipercepat non-stop.",
                },
              ].map((tier, i) => (
                <Reveal key={tier.title} delay={i * 0.06} className="rounded-card border border-line bg-surface p-6 flex flex-col justify-between">
                  <div>
                    <tier.icon size={26} weight="bold" className="text-accent-text" aria-hidden />
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">{tier.title}</h3>
                    <p className="font-mono text-xs text-accent-text">{tier.sub}</p>
                    <p className="mt-3 text-xs leading-relaxed text-muted">{tier.body}</p>
                  </div>
                  <span className="mt-6 block font-mono text-[11px] text-muted border-t border-line pt-3">
                    Transparan & Legal
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* SCROLLING SOCIAL PROOF: Dynamic Infinite-Scroll Testimonial Marquee */}
      <section aria-label="Testimoni" className="border-t border-line bg-bg-elevated py-20 md:py-32 overflow-hidden">
        <Container>
          <Reveal className="text-center max-w-3xl mx-auto">
            <Eyebrow>Scrolling Social Proof</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
              Pengalaman nyata dari mereka yang sudah nitip.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Ulasan terverifikasi dari mahasiswa, staf operasional, dan pemilik usaha yang mempercayakan kebutuhan IT mereka kepada kami.
            </p>
          </Reveal>
        </Container>

        {/* Marquee Tracks with Pause on Hover & Gradient Fade Mask */}
        <div className="pause-hover mt-14 flex flex-col gap-6">
          {/* Row 1: Leftward infinite scroll */}
          <div className="marquee-mask overflow-hidden py-2">
            <div className="marquee-track flex w-max items-stretch gap-6 pr-6">
              {marqueeRow1.map((t, i) => (
                <article
                  key={`t1-${t.id}-${i}`}
                  className="w-[360px] sm:w-[440px] shrink-0 flex flex-col justify-between rounded-[22px] border border-line bg-surface p-7 sm:p-8 shadow-[0_18px_36px_-16px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-line-strong hover:bg-surface-2"
                >
                  <blockquote className="text-base sm:text-[17px] font-medium leading-relaxed tracking-tight text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <div className="mt-8 border-t border-line/70 pt-5">
                    <p className="text-sm font-semibold text-ink leading-tight">{t.name}</p>
                    <p className="mt-1 text-xs text-muted leading-tight truncate">{t.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Row 2: Rightward reverse infinite scroll */}
          <div className="marquee-mask overflow-hidden py-2">
            <div className="marquee-reverse flex w-max items-stretch gap-6 pr-6">
              {marqueeRow2.map((t, i) => (
                <article
                  key={`t2-${t.id}-${i}`}
                  className="w-[360px] sm:w-[440px] shrink-0 flex flex-col justify-between rounded-[22px] border border-line bg-surface p-7 sm:p-8 shadow-[0_18px_36px_-16px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-line-strong hover:bg-surface-2"
                >
                  <blockquote className="text-base sm:text-[17px] font-medium leading-relaxed tracking-tight text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <div className="mt-8 border-t border-line/70 pt-5">
                    <p className="text-sm font-semibold text-ink leading-tight">{t.name}</p>
                    <p className="mt-1 text-xs text-muted leading-tight truncate">{t.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TANYA JAWAB (FAQ) */}
      <section id="tanya-jawab" className="scroll-mt-24 py-20 md:py-32">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <Eyebrow>Tanya Jawab</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
              Pertanyaan yang sering diajukan.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Transparansi adalah prioritas kami. Jika ada hal spesifik yang belum terjawab, diskusikan langsung bersama tim kami melalui WhatsApp tanpa dipungut biaya.
            </p>
            <ButtonLink
              href={whatsappLink("Halo titip.it, saya ingin tanya lebih lanjut sebelum memesan.", waPrimary)}
              variant="secondary"
              className="mt-8"
              size="lg"
            >
              <Headset size={18} weight="bold" aria-hidden />
              Konsultasi WhatsApp gratis
            </ButtonLink>
          </Reveal>

          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f, i) => (
              <Reveal as="div" key={f.id} delay={Math.min(i * 0.04, 0.15)}>
                <details className="group py-6" name="faq">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold tracking-tight text-ink hover:text-accent-text transition-colors [&::-webkit-details-marker]:hidden">
                    <span>{f.question}</span>
                    <span className="grid size-8 shrink-0 place-items-center rounded-pill border border-line text-ink-soft transition-transform duration-300 group-open:rotate-45" aria-hidden>
                      <ArrowUpRight size={15} weight="bold" className="rotate-45 group-open:rotate-0" />
                    </span>
                  </summary>
                  <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-muted">{f.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ACTION / CTA BANNER */}
      <section aria-label="Mulai pesan" className="pb-20 md:pb-32">
        <Container>
          <Reveal className="relative overflow-hidden rounded-card border border-line bg-surface p-8 md:p-12 lg:p-16 shadow-[var(--shadow-card)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-accent/15 blur-3xl"
            />

            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-accent-text">
                  Siap Membantu Kapan Saja
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
                  Punya tugas atau proyek IT yang harus segera beres?
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                  Kirimkan brief kamu sekarang. Tim kami mereview estimasi harga dan waktu pengerjaan maksimal 6 jam pada jam kerja.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <ButtonLink href={cta.order.href} size="lg">
                    {cta.order.label}
                    <ArrowRight size={17} weight="bold" aria-hidden />
                  </ButtonLink>
                  <ButtonLink
                    href={whatsappLink("Halo titip.it, saya mau tanya soal layanan.", waPrimary)}
                    size="lg"
                    variant="secondary"
                  >
                    <WhatsappLogo size={18} weight="bold" className="text-accent-text" aria-hidden />
                    Chat operator WhatsApp
                  </ButtonLink>
                </div>
              </div>

              <ul className="space-y-4 border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Kerahasiaan Terjamin",
                    desc: "Data pribadi, nama institusi, dan isi file tidak dibagikan ke publik.",
                  },
                  {
                    icon: FileText,
                    title: "File Sumber Utuh",
                    desc: "Source code, repositori, dan file desain mentah diserahkan tanpa disunat.",
                  },
                  {
                    icon: Headset,
                    title: "Dukungan Responsif",
                    desc: `Balasan cepat pada jam operasional melalui WhatsApp dan ${site.email}.`,
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-accent-soft text-accent-text">
                      <item.icon size={18} weight="bold" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
