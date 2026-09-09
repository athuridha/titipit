import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  category: z.string().trim().min(2).max(60),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  projectUrl: z.string().trim().url().optional().or(z.literal("")),
  tags: z.array(z.string().trim().max(30)).max(10).optional(),
  published: z.boolean().optional(),
});

function unauthorized() {
  return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const items = await prisma.portfolio.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ items });
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Isian belum benar" }, { status: 422 });
  }

  const item = await prisma.portfolio.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      imageUrl: parsed.data.imageUrl || null,
      projectUrl: parsed.data.projectUrl || null,
      tags: parsed.data.tags ?? [],
      published: parsed.data.published ?? true,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
