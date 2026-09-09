import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFonnteToken } from "@/lib/fonnte";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Perlu masuk sebagai operator" }, { status: 401 });
  }

  let tokenToUse: string | null = null;
  try {
    const body = await request.json();
    if (body?.token) {
      tokenToUse = String(body.token).trim();
    }
  } catch {}

  if (!tokenToUse) {
    tokenToUse = await getFonnteToken();
  }

  if (!tokenToUse) {
    return NextResponse.json(
      { error: "Token Fonnte belum diisi. Masukkan token Fonnte terlebih dahulu." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch("https://api.fonnte.com/get-whatsapp-group", {
      method: "POST",
      headers: {
        Authorization: tokenToUse,
      },
    });

    const data = await res.json();
    if (!res.ok || data.status === false) {
      return NextResponse.json(
        { error: data.reason || data.message || "Gagal mengambil daftar grup dari Fonnte" },
        { status: 400 },
      );
    }

    // Fonnte returns array of groups or { data: [...] }
    const rawGroups = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    const groups = rawGroups.map((g: any) => ({
      id: String(g.id || g.jid || ""),
      name: String(g.name || g.subject || "Grup WhatsApp"),
      memberCount: g.member_count || g.participants?.length || undefined,
    })).filter((g: any) => Boolean(g.id));

    return NextResponse.json({ groups });
  } catch (err: any) {
    console.error("Fonnte get groups error:", err);
    return NextResponse.json(
      { error: "Gagal terhubung ke server Fonnte." },
      { status: 500 },
    );
  }
}
