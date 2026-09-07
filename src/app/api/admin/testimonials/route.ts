import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function unauthorized() {
  return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ testimonials });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const role = String(body.role ?? "").trim();
  const quote = String(body.quote ?? "").trim();
  const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));

  if (!name || !role || !quote) {
    return NextResponse.json(
      { error: "Nama, peran, dan ulasan wajib diisi." },
      { status: 400 },
    );
  }

  const randomSeed = `titipit-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;

  const created = await prisma.testimonial.create({
    data: {
      name,
      role,
      quote,
      rating,
      avatarSeed: randomSeed,
      published: body.published ?? true,
      sortOrder: 0,
    },
  });

  return NextResponse.json({ testimonial: created }, { status: 201 });
}
