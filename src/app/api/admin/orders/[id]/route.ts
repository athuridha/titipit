import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { fieldErrors, orderUpdateSchema } from "@/lib/validation";
import { statusLabel } from "@/lib/status";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = orderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Isian belum benar", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const existing = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  const { status, quotedPrice, note } = parsed.data;

  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      quotedPrice: quotedPrice ?? undefined,
      events: {
        create: {
          status,
          note: note || `Status diperbarui menjadi ${statusLabel[status]}.`,
        },
      },
    },
    select: { id: true, code: true, status: true, quotedPrice: true },
  });

  // Auto-generate a one-time testimonial token when order is marked SELESAI
  let testimonialLink: string | null = null;
  if (status === "SELESAI") {
    const existing = await prisma.testimonialToken.findUnique({
      where: { orderId: id },
    });
    if (!existing) {
      const token = randomBytes(24).toString("base64url");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await prisma.testimonialToken.create({
        data: { token, orderId: id, expiresAt },
      });
      testimonialLink = `/testimoni/t/${token}`;
    }
  }

  return NextResponse.json({ order, testimonialLink });
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

  const existing = await prisma.order.findUnique({
    where: { id },
    select: { id: true, code: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  // Delete testimonial token if exists
  await prisma.testimonialToken.deleteMany({ where: { orderId: id } });
  // Delete events then the order
  await prisma.orderEvent.deleteMany({ where: { orderId: id } });
  await prisma.order.delete({ where: { id } });

  return NextResponse.json({ ok: true, code: existing.code });
}
