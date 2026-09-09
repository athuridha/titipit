import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function unauthorized() {
  return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const settings = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  return NextResponse.json({ settings: map });
}

const schema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

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

  const { key, value } = parsed.data;

  const setting = await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json({ setting });
}
