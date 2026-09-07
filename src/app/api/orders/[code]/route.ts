import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeOrderCode } from "@/lib/order-code";

/** Public tracking endpoint. Returns only what the customer needs to see. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const normalized = normalizeOrderCode(code);

  const order = await prisma.order.findUnique({
    where: { code: normalized },
    select: {
      code: true,
      title: true,
      status: true,
      quotedPrice: true,
      deadline: true,
      createdAt: true,
      updatedAt: true,
      name: true,
      service: { select: { name: true, turnaround: true } },
      events: {
        orderBy: { createdAt: "asc" },
        select: { status: true, note: true, createdAt: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Kode pesanan tidak ditemukan. Periksa lagi atau hubungi kami." },
      { status: 404 },
    );
  }

  // Only the first name is exposed, so a leaked code cannot reveal full identity.
  const [firstName] = order.name.split(" ");

  return NextResponse.json({
    order: { ...order, name: firstName },
  });
}
