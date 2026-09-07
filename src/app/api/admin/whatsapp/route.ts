import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { fieldErrors, whatsappNumberSchema } from "@/lib/validation";

function unauthorized() {
  return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const numbers = await prisma.whatsappNumber.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ numbers });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = whatsappNumberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Isian belum benar", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const count = await prisma.whatsappNumber.count();
  const created = await prisma.whatsappNumber.create({
    data: {
      label: parsed.data.label,
      number: parsed.data.number,
      active: parsed.data.active ?? true,
      sortOrder: count,
    },
  });
  return NextResponse.json({ number: created }, { status: 201 });
}
