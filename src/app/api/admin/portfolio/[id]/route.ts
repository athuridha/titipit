import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const patchSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  category: z.string().trim().min(2).max(60).optional(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  projectUrl: z.string().trim().url().optional().or(z.literal("")),
  tags: z.array(z.string().trim().max(30)).max(10).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

function unauthorized() {
  return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const existing = await prisma.portfolio.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Portfolio tidak ditemukan" }, { status: 404 });
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

  const updated = await prisma.portfolio.update({
    where: { id },
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl === "" ? null : parsed.data.imageUrl,
      projectUrl: parsed.data.projectUrl === "" ? null : parsed.data.projectUrl,
    },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const existing = await prisma.portfolio.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Portfolio tidak ditemukan" }, { status: 404 });
  }

  await prisma.portfolio.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
