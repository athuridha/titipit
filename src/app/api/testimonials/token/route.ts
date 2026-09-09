import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();
    const name = String(body.name ?? "").trim();
    const role = String(body.role ?? "").trim();
    const quote = String(body.quote ?? "").trim();
    const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));

    if (!token) {
      return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Nama wajib diisi minimal 2 karakter." }, { status: 400 });
    }

    if (!role || role.length < 2) {
      return NextResponse.json({ error: "Peran / kampus / bisnis wajib diisi." }, { status: 400 });
    }

    if (!quote || quote.length < 10) {
      return NextResponse.json({ error: "Ulasan wajib diisi minimal 10 karakter." }, { status: 400 });
    }

    const record = await prisma.testimonialToken.findUnique({
      where: { token },
      include: {
        order: { select: { code: true, name: true } },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Link ulasan tidak valid." }, { status: 404 });
    }

    if (record.usedAt) {
      return NextResponse.json(
        { error: "Link ulasan ini sudah pernah digunakan." },
        { status: 410 },
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Link ulasan sudah kedaluwarsa." },
        { status: 410 },
      );
    }

    const randomSeed = `titipit-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;

    const [testimonial] = await prisma.$transaction([
      prisma.testimonial.create({
        data: {
          name,
          role: `${role} (Klien Terverifikasi)`,
          quote,
          rating,
          avatarSeed: randomSeed,
          published: true,
          sortOrder: 0,
        },
      }),
      prisma.testimonialToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      testimonial,
      message: "Terima kasih! Ulasan kamu berhasil dikirim.",
    });
  } catch (error) {
    console.error("Gagal menyimpan testimoni (token):", error);
    return NextResponse.json(
      { error: "Terjadi kendala saat menyimpan ulasan. Coba beberapa saat lagi." },
      { status: 500 },
    );
  }
}
