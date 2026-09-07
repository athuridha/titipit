import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderInputSchema, fieldErrors } from "@/lib/validation";
import { generateOrderCode } from "@/lib/order-code";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const limit = rateLimit(`order:${clientKey(request)}`, 5);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Terlalu banyak pesanan dari perangkat ini. Coba lagi dalam satu jam atau hubungi kami lewat WhatsApp.",
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = orderInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Beberapa isian belum benar", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const input = parsed.data;

  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, active: true },
    select: { id: true, name: true },
  });
  if (!service) {
    return NextResponse.json(
      { error: "Layanan tidak ditemukan", fields: { serviceId: "Pilih layanan yang tersedia" } },
      { status: 422 },
    );
  }

  if (
    input.budgetMin !== undefined &&
    input.budgetMax !== undefined &&
    input.budgetMin > input.budgetMax
  ) {
    return NextResponse.json(
      {
        error: "Rentang budget terbalik",
        fields: { budgetMax: "Batas atas harus lebih besar dari batas bawah" },
      },
      { status: 422 },
    );
  }

  // Collisions are astronomically unlikely, but a unique code is a hard promise
  // to the customer, so retry rather than fail the request.
  let code = generateOrderCode();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const clash = await prisma.order.findUnique({ where: { code }, select: { id: true } });
    if (!clash) break;
    code = generateOrderCode();
  }

  const order = await prisma.order.create({
    data: {
      code,
      name: input.name,
      email: input.email,
      whatsapp: input.whatsapp,
      campus: input.campus || null,
      serviceId: service.id,
      title: input.title,
      brief: input.brief,
      urgency: input.urgency,
      deadline: input.deadline ?? null,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      events: {
        create: {
          status: "MENUNGGU_REVIEW",
          note: "Brief diterima dan masuk antrean review.",
        },
      },
    },
    select: { code: true, title: true, createdAt: true },
  });

  return NextResponse.json(
    {
      code: order.code,
      title: order.title,
      service: service.name,
      createdAt: order.createdAt,
    },
    { status: 201 },
  );
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { service: { select: { name: true } } },
  });

  return NextResponse.json({ orders });
}
