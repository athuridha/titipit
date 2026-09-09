export const site = {
  name: "titip.it",
  tagline: "Titipin kerjaan IT kamu.",
  description:
    "Layanan digital untuk tugas kuliah IT, pembuatan web dan aplikasi, automasi, desain, sampai setup server. Brief masuk, harga jelas, dikerjakan orang yang paham.",
  url: "https://titip.it",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "titip.it",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "6281234567890",
  email: "halo@titip.it",
} as const;

export function whatsappLink(message: string, number?: string) {
  const target = (number ?? site.whatsapp).replace(/\D/g, "");
  const normalized = target.startsWith("0") ? `62${target.slice(1)}` : target;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export const navLinks = [
  { label: "Layanan", href: "/#layanan" },
  { label: "Cara kerja", href: "/#cara-kerja" },
  { label: "Portofolio", href: "/portofolio" },
  { label: "Harga", href: "/#harga" },
  { label: "Tanya jawab", href: "/#tanya-jawab" },
] as const;

/** One label per CTA intent, used identically everywhere on the site. */
export const cta = {
  order: { label: "Mulai pesan", href: "/pesan" },
  services: { label: "Lihat layanan", href: "/#layanan" },
  track: { label: "Cek pesanan", href: "/lacak" },
} as const;
