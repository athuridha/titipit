import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";

export type PublicWhatsapp = { label: string; number: string };

/** 0812… / +62812… / 62812… -> 62812… (format wa.me). */
export function toWaNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

export function whatsappLinkFor(number: string, message: string) {
  return `https://wa.me/${toWaNumber(number)}?text=${encodeURIComponent(message)}`;
}

/** Nomor aktif urut tampilan. Kosong -> fallback satu nomor dari env. */
export async function getWhatsappNumbers(): Promise<PublicWhatsapp[]> {
  try {
    const rows = await prisma.whatsappNumber.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { label: true, number: true },
    });
    if (rows.length > 0) return rows;
  } catch {
    // DB tidak terjangkau saat prerender — pakai fallback env.
  }
  return [{ label: "Operator", number: site.whatsapp }];
}
