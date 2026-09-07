import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizeOrderCode } from "@/lib/order-code";
import { Container } from "@/components/ui/container";
import { TestimonialForm } from "../testimoni-form";

export const metadata: Metadata = {
  title: "Beri Ulasan Pesanan - titip.it",
  description: "Formulir ulasan dan testimoni pengalaman pengerjaan IT di titip.it.",
};

export default async function OrderTestimoniPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = normalizeOrderCode(code);

  const order = await prisma.order.findUnique({
    where: { code: normalized },
    select: {
      code: true,
      name: true,
      campus: true,
      title: true,
      service: { select: { name: true } },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-[80vh] py-12 md:py-20 flex items-center justify-center">
      <Container>
        <TestimonialForm
          initialOrderCode={order.code}
          initialName={order.name}
          initialTitle={order.title}
          initialServiceName={order.service.name}
        />
      </Container>
    </main>
  );
}
