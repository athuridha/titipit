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

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  if (session.role !== "SUPERADMIN") return forbidden();

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

const createSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username minimal 3 karakter")
    .max(32, "Username maksimal 32 karakter")
    .regex(/^[a-z0-9_]+$/, "Username hanya huruf kecil, angka, garis bawah"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(60, "Nama maksimal 60 karakter"),
  role: z.enum(["SUPERADMIN", "ADMIN"]).default("ADMIN"),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (session.role !== "SUPERADMIN") return forbidden();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Isian belum benar", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const existing = await prisma.adminUser.findUnique({
    where: { username: parsed.data.username },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Username sudah dipakai", fields: { username: "Username sudah dipakai" } },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.adminUser.create({
    data: {
      username: parsed.data.username,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash,
      mustChangePassword: true,
    },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
