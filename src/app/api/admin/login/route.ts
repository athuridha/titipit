import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { adminLoginSchema, fieldErrors } from "@/lib/validation";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: Request) {
  const limit = rateLimit(`login:${clientKey(request)}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Percobaan masuk terlalu sering. Tunggu 15 menit." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Isian belum lengkap", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  // Cloudflare Turnstile verification
  const turnstileToken = typeof (body as any)?.turnstileToken === "string" ? (body as any).turnstileToken : "";
  const isTurnstileValid = await verifyTurnstileToken(turnstileToken);
  if (!isTurnstileValid) {
    return NextResponse.json(
      { error: "Verifikasi keamanan Cloudflare gagal. Coba muat ulang halaman." },
      { status: 403 },
    );
  }

  const user = await prisma.adminUser.findUnique({
    where: { username: parsed.data.username },
  });

  // Same response for unknown username and wrong password so the endpoint
  // does not confirm which operator accounts exist.
  const valid = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !valid) {
    return NextResponse.json(
      { error: "Username atau password tidak cocok" },
      { status: 401 },
    );
  }

  const token = await createSessionToken({
    sub: user.id,
    username: user.username,
    name: user.name,
  });

  const response = NextResponse.json({ name: user.name });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
