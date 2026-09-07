"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/wordmark";
import { Container } from "@/components/ui/container";
import { cta, navLinks, site, whatsappLink } from "@/lib/site";
import type { PublicWhatsapp } from "@/lib/whatsapp";

export function SiteFooter({ numbers }: { numbers: PublicWhatsapp[] }) {
  return (
    <Suspense>
      <SiteFooterInner numbers={numbers} />
    </Suspense>
  );
}

function SiteFooterInner({ numbers }: { numbers: PublicWhatsapp[] }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  const year = new Date().getFullYear();
  const primary = numbers[0];

  return (
    <footer className="border-t border-line bg-bg-elevated">
      <Container className="py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-muted">
              Kerjaan IT yang numpuk kami ambil alih. Brief masuk, harga jelas di
              depan, hasilnya kamu pahami.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={whatsappLink("Halo titip.it, saya mau tanya soal layanan.", primary?.number)}
                target="_blank"
                rel="noreferrer"
                aria-label="Hubungi titip.it di WhatsApp"
                className="grid size-10 place-items-center rounded-pill border border-line text-ink-soft transition-colors hover:border-accent-hairline hover:text-ink"
              >
                <WhatsappLogo size={18} weight="bold" />
              </a>
              <a
                href={`https://instagram.com/${site.instagram}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram titip.it"
                className="grid size-10 place-items-center rounded-pill border border-line text-ink-soft transition-colors hover:border-accent-hairline hover:text-ink"
              >
                <InstagramLogo size={18} weight="bold" />
              </a>
            </div>
          </div>

          <nav aria-label="Halaman">
            <h2 className="text-sm font-semibold text-ink">Halaman</h2>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={cta.track.href}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {cta.track.label}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-ink">Kontak</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="transition-colors hover:text-ink"
                >
                  {site.email}
                </a>
              </li>
              {numbers.map((n) => (
                <li key={`${n.label}-${n.number}`}>
                  <a
                    href={whatsappLink("Halo titip.it, saya mau tanya soal layanan.", n.number)}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-ink"
                  >
                    WhatsApp {n.label} · {n.number}
                  </a>
                </li>
              ))}
              <li>Balasan pada 09.00 sampai 22.00 WIB</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            {year} {site.name}. Semua pekerjaan dikerjakan atas permintaan klien.
          </p>
          <p>
            Kami tidak membagikan identitas maupun isi pekerjaan klien ke pihak lain.
          </p>
        </div>
      </Container>
    </footer>
  );
}
