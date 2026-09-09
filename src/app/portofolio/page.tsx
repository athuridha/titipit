import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, FolderOpen } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { Container, Eyebrow } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cta } from "@/lib/site";

export const metadata: Metadata = {
  title: "Portofolio - titip.it",
  description: "Hasil karya dan proyek yang telah dikerjakan oleh tim titip.it.",
};

export const revalidate = 300;

type PortfolioItem = {
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

export default async function PortfolioPage() {
  const items: PortfolioItem[] = await (prisma as any).portfolio.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const categories: string[] = Array.from(new Set(items.map((i: PortfolioItem) => i.category)));

  return (
    <div className="overflow-x-hidden w-full max-w-full">
      <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(55%_50%_at_50%_0%,var(--accent-soft)_0%,transparent_75%)]"
        />
        <Container className="relative z-10">
          <Reveal className="mx-auto flex flex-col items-center text-center">
            <Eyebrow>Portofolio</Eyebrow>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
              Proyek yang sudah kami kerjakan.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Setiap proyek dikerjakan dengan standar kualitas tinggi dan penyerahan kode sumber utuh.
            </p>
          </Reveal>

          {items.length === 0 ? (
            <Reveal>
              <div className="mx-auto mt-16 max-w-md rounded-card border border-line bg-surface p-10 text-center">
                <FolderOpen size={48} className="mx-auto text-muted" />
                <p className="mt-4 text-sm text-muted">
                  Belum ada portofolio yang ditampilkan. Hubungi kami untuk diskusi proyek.
                </p>
                <ButtonLink href={cta.order.href} className="mt-6">
                  {cta.order.label}
                  <ArrowRight size={15} weight="bold" aria-hidden />
                </ButtonLink>
              </div>
            </Reveal>
          ) : (
            <>
              {categories.length > 1 ? (
                <Reveal>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-pill border border-line bg-surface px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-muted"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </Reveal>
              ) : null}

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, i) => (
                  <Reveal
                    as="article"
                    key={item.id}
                    delay={Math.min(i * 0.05, 0.25)}
                    className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-all duration-300 hover:border-line-strong hover:shadow-lg"
                  >
                    {item.imageUrl ? (
                      <div className="aspect-video overflow-hidden bg-surface-2">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-surface-2">
                        <FolderOpen size={40} className="text-muted/30" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-pill border border-line bg-surface-2 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                          {item.category}
                        </span>
                        {item.projectUrl ? (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="grid size-8 shrink-0 place-items-center rounded-pill text-muted transition hover:text-accent-text"
                            aria-label={`Buka proyek ${item.title}`}
                          >
                            <ArrowUpRight size={16} weight="bold" />
                          </a>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink group-hover:text-accent-text transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                        {item.description}
                      </p>
                      {item.tags.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-text"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </Reveal>
                ))}
              </div>
            </>
          )}

          <Reveal>
            <div className="mt-16 text-center">
              <ButtonLink href={cta.order.href} size="lg">
                Mulai proyek bersama kami
                <ArrowRight size={17} weight="bold" aria-hidden />
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
