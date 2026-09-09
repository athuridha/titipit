import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().trim().min(3).max(120),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/, "Slug hanya huruf kecil, angka, dan strip"),
  tagline: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(2000),
  category: z.enum(["AKADEMIK", "DEVELOPMENT", "DESIGN", "DATA", "INFRA"]),
  priceFrom: z.number().int().min(0),
  turnaround: z.string().trim().min(2).max(100),
  deliverables: z.array(z.string().trim()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Isian belum benar", issues: parsed.error.issues }, { status: 422 });
  }

  const existingSlug = await prisma.service.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existingSlug) {
    return NextResponse.json({ error: "Slug sudah digunakan layanan lain" }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      ...parsed.data,
      imageSeed: parsed.data.slug,
      sortOrder: 0,
    },
  });

  return NextResponse.json({ service }, { status: 201 });
}
