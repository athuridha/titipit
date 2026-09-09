import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  quote: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Testimoni tidak ditemukan" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Isian belum benar" }, { status: 422 });
  }

  const updated = await prisma.testimonial.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ testimonial: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Testimoni tidak ditemukan" }, { status: 404 });
  }

  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true, id });
}
