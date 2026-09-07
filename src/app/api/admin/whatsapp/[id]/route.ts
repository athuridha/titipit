import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { fieldErrors, whatsappNumberSchema } from "@/lib/validation";

function unauthorized() {
  return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
}

const partialSchema = whatsappNumberSchema.partial();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const existing = await prisma.whatsappNumber.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Nomor tidak ditemukan" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = partialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Isian belum benar", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const updated = await prisma.whatsappNumber.update({
    where: { id },
    data: {
      label: parsed.data.label ?? undefined,
      number: parsed.data.number ?? undefined,
      active: parsed.data.active ?? undefined,
    },
  });
  return NextResponse.json({ number: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const existing = await prisma.whatsappNumber.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Nomor tidak ditemukan" }, { status: 404 });
  }

  await prisma.whatsappNumber.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
