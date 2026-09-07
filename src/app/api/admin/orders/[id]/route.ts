import { NextResponse } from "next/server";
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

  return NextResponse.json({ order });
}
