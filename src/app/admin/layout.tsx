import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Admin — titip.it",
  description: "Dashboard operator titip.it.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f6fd] text-slate-900 antialiased">{children}</div>
  );
}
