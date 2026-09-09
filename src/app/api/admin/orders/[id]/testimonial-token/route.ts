import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, code: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 hari

  // Upsert token baru (generate ulang jika sudah ada, atau buat jika belum ada)
  await prisma.testimonialToken.upsert({
    where: { orderId: id },
    create: {
      token,
      orderId: id,
      expiresAt,
    },
    update: {
      token,
      expiresAt,
      usedAt: null, // Reset status pemakaian jika digenerate ulang
    },
  });

  const testimonialLink = `/testimoni/t/${token}`;

  return NextResponse.json({
    ok: true,
    testimonialLink,
  });
}
