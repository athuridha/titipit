import { OrderStatus, ServiceCategory, Urgency } from "@prisma/client";

export const statusLabel: Record<OrderStatus, string> = {
  MENUNGGU_REVIEW: "Menunggu review",
  MENUNGGU_PEMBAYARAN: "Menunggu pembayaran",
  DIKERJAKAN: "Dikerjakan",
  REVISI: "Revisi",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

export const statusOrder: OrderStatus[] = [
  "MENUNGGU_REVIEW",
  "MENUNGGU_PEMBAYARAN",
  "DIKERJAKAN",
  "REVISI",
  "SELESAI",
  "DIBATALKAN",
];

export const categoryLabel: Record<ServiceCategory, string> = {
  AKADEMIK: "Akademik",
  DEVELOPMENT: "Development",
  DESIGN: "Desain",
  DATA: "Data",
  INFRA: "Infrastruktur",
};

export const urgencyLabel: Record<Urgency, string> = {
  SANTAI: "Santai, tidak buru buru",
  NORMAL: "Normal, ikut estimasi",
  KILAT: "Kilat, tambah biaya 40 persen",
};

/** Progress index for the tracking timeline. Cancelled sits outside the track. */
export function statusProgress(status: OrderStatus) {
  const track: OrderStatus[] = [
    "MENUNGGU_REVIEW",
    "MENUNGGU_PEMBAYARAN",
    "DIKERJAKAN",
    "SELESAI",
  ];
  if (status === "REVISI") return 2;
  if (status === "DIBATALKAN") return -1;
  return track.indexOf(status);
}
