import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { TestimonialForm } from "./testimoni-form";

export const metadata: Metadata = {
  title: "Beri Ulasan - titip.it",
  description: "Formulir ulasan dan testimoni pengalaman pengerjaan IT di titip.it.",
};

export default async function TestimoniPage({
  searchParams,
}: {
  searchParams: Promise<{ nama?: string; peran?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="min-h-[80vh] py-12 md:py-20 flex items-center justify-center">
      <Container>
        <TestimonialForm initialName={sp?.nama ?? ""} />
      </Container>
    </main>
  );
}
