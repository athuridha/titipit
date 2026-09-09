import { z } from "zod";

const indonesianPhone = /^(?:\+?62|0)8[1-9][0-9]{6,11}$/;

export const orderInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(80, "Nama maksimal 80 karakter"),
  email: z.string().trim().toLowerCase().email("Format email belum benar"),
  whatsapp: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .refine((value) => indonesianPhone.test(value), {
      message: "Nomor WhatsApp Indonesia belum valid, contoh 081234567890",
    }),
  campus: z.string().trim().max(120).optional().or(z.literal("")),
  serviceId: z.string().trim().min(1, "Pilih salah satu layanan"),
  title: z
    .string()
    .trim()
    .min(6, "Judul pekerjaan minimal 6 karakter")
    .max(140, "Judul maksimal 140 karakter"),
  brief: z
    .string()
    .trim()
    .min(30, "Brief minimal 30 karakter supaya kami bisa hitung harga")
    .max(4000, "Brief maksimal 4000 karakter"),
  attachmentUrl: z.string().trim().url().optional().or(z.literal("")),
  urgency: z.enum(["SANTAI", "NORMAL", "KILAT"]).default("NORMAL"),
  deadline: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? new Date(value) : undefined))
    .refine((value) => !value || !Number.isNaN(value.getTime()), {
      message: "Tanggal deadline tidak terbaca",
    }),
  budgetMin: z.coerce.number().int().min(0).max(500_000_000).optional(),
  budgetMax: z.coerce.number().int().min(0).max(500_000_000).optional(),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

export const adminLoginSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username minimal 3 karakter")
    .max(32, "Username maksimal 32 karakter")
    .regex(/^[a-z0-9_]+$/, "Username hanya huruf kecil, angka, garis bawah"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const orderUpdateSchema = z.object({
  status: z.enum([
    "MENUNGGU_REVIEW",
    "MENUNGGU_PEMBAYARAN",
    "DIKERJAKAN",
    "REVISI",
    "SELESAI",
    "DIBATALKAN",
  ]),
  quotedPrice: z.coerce.number().int().min(0).max(500_000_000).optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const whatsappNumberSchema = z.object({
  label: z
    .string()
    .trim()
    .min(3, "Label minimal 3 karakter")
    .max(40, "Label maksimal 40 karakter"),
  number: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .refine((value) => /^(?:\+?62|0)8[1-9][0-9]{6,11}$/.test(value), {
      message: "Nomor WhatsApp Indonesia belum valid, contoh 081234567890",
    }),
  active: z.boolean().optional(),
});

/** Turns a ZodError into a field keyed map the forms can render inline. */
export function fieldErrors(error: z.ZodError) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
