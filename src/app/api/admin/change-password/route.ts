import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getSession,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

const schema = z.object({
  currentPassword: z.string().optional(),
  password: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak sama",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Perlu masuk terlebih dahulu" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ error: "Isian belum benar", fields }, { status: 422 });
  }

  const currentUser = await prisma.adminUser.findUnique({
    where: { id: session.sub },
  });
  if (!currentUser) {
    return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
  }

  // If not first-login forced change, require current password
  if (!currentUser.mustChangePassword) {
    if (!parsed.data.currentPassword) {
      return NextResponse.json(
        { error: "Password saat ini wajib diisi", fields: { currentPassword: "Password saat ini wajib diisi" } },
        { status: 422 },
      );
    }
    const valid = await bcrypt.compare(parsed.data.currentPassword, currentUser.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Password saat ini salah", fields: { currentPassword: "Password saat ini salah" } },
        { status: 401 },
      );
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.adminUser.update({
    where: { id: session.sub },
    data: { passwordHash, mustChangePassword: false },
  });

  const token = await createSessionToken({
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    mustChangePassword: false,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
