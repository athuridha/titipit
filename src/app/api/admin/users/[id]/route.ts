import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { fieldErrors } from "@/lib/validation";

function unauthorized() {
  return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Hanya Super Admin yang bisa mengelola pengguna" }, { status: 403 });
}

const updateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(60, "Nama maksimal 60 karakter")
    .optional(),
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
  role: z.enum(["SUPERADMIN", "ADMIN"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (session.role !== "SUPERADMIN") return forbidden();

  const { id } = await params;

  if (id === session.sub) {
    return NextResponse.json(
      { error: "Gunakan halaman Pengaturan untuk mengubah akun sendiri" },
      { status: 400 },
    );
  }

  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Isian belum benar", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.role) data.role = parsed.data.role;
  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  const user = await prisma.adminUser.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (session.role !== "SUPERADMIN") return forbidden();

  const { id } = await params;

  if (id === session.sub) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun sendiri" },
      { status: 400 },
    );
  }

  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  }

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
