import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";

export async function getFonnteConfig(): Promise<{ token: string | null; target: string | null }> {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: ["FONNTE_TOKEN", "FONNTE_TARGET"] } },
    });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return {
      token: map.FONNTE_TOKEN || process.env.FONNTE_TOKEN || null,
      target: map.FONNTE_TARGET || process.env.FONNTE_TARGET || null,
    };
  } catch {
    return {
      token: process.env.FONNTE_TOKEN || null,
      target: process.env.FONNTE_TARGET || null,
    };
  }
}

export async function getFonnteToken(): Promise<string | null> {
  const cfg = await getFonnteConfig();
  return cfg.token;
}

export async function sendFonnteMessage(targetParam: string, message: string) {
  const token = await getFonnteToken();
  if (!token) {
    console.warn("Fonnte token belum diset.");
    return { success: false, error: "Fonnte token belum diset." };
  }

  // Target can be a single number, comma separated numbers, or group ID (e.g. 12036302...@g.us)
  const target = targetParam.trim();

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target,
        message,
        countryCode: "62",
      }),
    });

    const data = await res.json();
    return { success: res.ok && data.status, data };
  } catch (err: any) {
    console.error("Gagal mengirim via Fonnte:", err);
    return { success: false, error: err.message };
  }
}

type NewOrderNotificationData = {
  code: string;
  name: string;
  whatsapp: string;
  serviceName: string;
  urgency: string;
  budgetMin: number | null;
  budgetMax: number | null;
  title: string;
  brief: string;
  attachmentUrl?: string | null;
};

export async function notifyNewOrder(order: NewOrderNotificationData) {
  const cfg = await getFonnteConfig();
  if (!cfg.token || !cfg.target) {
    return;
  }

  // Clean whatsapp phone for link
  const cleanPhone = order.whatsapp.replace(/\D/g, "");
  const normalizedPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const waLink = `https://wa.me/${normalizedPhone}`;

  // Urgency text
  const urgencyLabel =
    order.urgency === "KILAT"
      ? "Kilat, tambah biaya 40 persen"
      : order.urgency === "SANTAI"
        ? "Santai"
        : "Normal";

  // Budget formatting
  let budgetText = "Fleksibel / Belum ditentukan";
  if (order.budgetMin !== null && order.budgetMax !== null) {
    budgetText = `${formatRupiah(order.budgetMin)} - ${formatRupiah(order.budgetMax)}`;
  } else if (order.budgetMin !== null) {
    budgetText = `Mulai ${formatRupiah(order.budgetMin)}`;
  } else if (order.budgetMax !== null) {
    budgetText = `Hingga ${formatRupiah(order.budgetMax)}`;
  }

  const attachmentPart = order.attachmentUrl ? `\n📎 *Lampiran File:*\n${order.attachmentUrl}` : "";

  const message = `🚨 *PESANAN BARU MASUK!* 🚨
━━━━━━━━━━━━━━━━━
📋 *Kode:* ${order.code}
👤 *Nama:* ${order.name}
📱 *WhatsApp Klien:* ${waLink}
🛠 *Layanan:* ${order.serviceName}
⚡ *Urgensi:* ${urgencyLabel}
💰 *Budget:* ${budgetText}
📝 *Judul:* ${order.title}
📄 *Brief:*
${order.brief}${attachmentPart}
━━━━━━━━━━━━━━━━━
🔗 *Buka Panel Admin:*
http://titipit.codzy.net/admin`;

  await sendFonnteMessage(cfg.target, message);
}
