import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeOrderCode } from "@/lib/order-code";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const role = String(body.role ?? "").trim();
    const quote = String(body.quote ?? "").trim();
    const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));
    const orderCode = body.orderCode ? String(body.orderCode).trim() : null;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Nama wajib diisi minimal 2 karakter." },
        { status: 400 },
      );
    }

    if (!role || role.length < 2) {
      return NextResponse.json(
        { error: "Peran / kampus / bisnis wajib diisi." },
        { status: 400 },
      );
    }

    if (!quote || quote.length < 10) {
      return NextResponse.json(
        { error: "Ulasan wajib diisi minimal 10 karakter." },
        { status: 400 },
      );
    }

    // Optional verification against order code
    let verified = false;
    if (orderCode) {
      try {
        const normalized = normalizeOrderCode(orderCode);
        const order = await prisma.order.findUnique({
          where: { code: normalized },
          select: { id: true, name: true },
        });
        if (order) {
          verified = true;
        }
      } catch {
        // Continue even if normalization fails
      }
    }

    const randomSeed = `titipit-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role: verified && !role.includes("Klien") ? `${role} (Klien Terverifikasi)` : role,
        quote,
        rating,
        avatarSeed: randomSeed,
        published: true, // Automatically published, admin can toggle anytime
        sortOrder: 0,
      },
    });

    return NextResponse.json({
      ok: true,
      testimonial,
      message: "Terima kasih banyak! Ulasan kamu berhasil dikirim.",
    });
  } catch (error) {
    console.error("Gagal menyimpan testimoni:", error);
    return NextResponse.json(
      { error: "Terjadi kendala saat menyimpan ulasan. Coba beberapa saat lagi." },
      { status: 500 },
    );
  }
}
