import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { TokenTestimonialForm } from "./token-form";

export const metadata: Metadata = {
  title: "Beri Ulasan Pesanan - titip.it",
  description: "Formulir ulasan satu kali pakai untuk pesanan yang telah selesai.",
};

export default async function TokenTestimoniPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const record = await prisma.testimonialToken.findUnique({
    where: { token },
    include: {
      order: {
        select: {
          code: true,
          name: true,
          campus: true,
          title: true,
          service: { select: { name: true } },
        },
      },
    },
  });

  if (!record) notFound();

  if (record.usedAt) {
    return (
      <main className="min-h-[80vh] py-12 md:py-20 flex items-center justify-center">
        <Container>
          <div className="mx-auto w-full max-w-lg rounded-card border border-line bg-surface p-8 text-center shadow-[var(--shadow-card)] sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Link sudah digunakan
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Kamu sudah pernah mengirim ulasan lewat link ini. Terima kasih atas feedback-nya!
            </p>
          </div>
        </Container>
      </main>
    );
  }

  if (record.expiresAt < new Date()) {
    return (
      <main className="min-h-[80vh] py-12 md:py-20 flex items-center justify-center">
        <Container>
          <div className="mx-auto w-full max-w-lg rounded-card border border-line bg-surface p-8 text-center shadow-[var(--shadow-card)] sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Link sudah kedaluwarsa
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Link ulasan ini sudah melewati batas waktu 30 hari. Hubungi admin jika butuh link baru.
            </p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] py-12 md:py-20 flex items-center justify-center">
      <Container>
        <TokenTestimonialForm
          token={token}
          orderCode={record.order.code}
          initialName={record.order.name}
          initialTitle={record.order.title}
          initialServiceName={record.order.service.name}
        />
      </Container>
    </main>
  );
}
