import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().trim().min(3).max(120).optional(),
  slug: z.string().trim().min(3).max(120).optional(),
  tagline: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  category: z.enum(["AKADEMIK", "DEVELOPMENT", "DESIGN", "DATA", "INFRA"]).optional(),
  priceFrom: z.number().int().min(0).optional(),
  turnaround: z.string().trim().min(2).max(100).optional(),
  deliverables: z.array(z.string().trim()).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
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
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Isian belum benar", issues: parsed.error.issues }, { status: 422 });
  }

  const updated = await prisma.service.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ service: updated });
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
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });
  }

  // Check if orders are linked
  const orderCount = await prisma.order.count({ where: { serviceId: id } });
  if (orderCount > 0) {
    return NextResponse.json(
      { error: `Tidak dapat menghapus. Masih ada ${orderCount} pesanan terkait layanan ini.` },
      { status: 400 },
    );
  }

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
