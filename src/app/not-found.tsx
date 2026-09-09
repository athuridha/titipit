import Link from "next/link";
import { ArrowLeft, House, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

export default function NotFound() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center py-16 text-center">
      <Container className="flex max-w-md flex-col items-center">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text">
          Galat 404
        </span>

        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
          Halaman tidak ditemukan.
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted">
          Halaman yang kamu tuju mungkin telah dipindah, dihapus, atau tautan yang kamu masukkan keliru.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/" size="lg">
            <House size={18} weight="bold" aria-hidden />
            Kembali ke Beranda
          </ButtonLink>
          <ButtonLink href="/lacak" size="lg" variant="secondary">
            <MagnifyingGlass size={18} weight="bold" aria-hidden />
            Lacak Pesanan
          </ButtonLink>
        </div>

        <p className="mt-10 font-mono text-xs text-muted">
          titip.it · Urusan IT beres rapi.
        </p>
      </Container>
    </div>
  );
}
