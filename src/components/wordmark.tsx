import Image from "next/image";
import Link from "next/link";

/** Brand lockup: mark glow biru + wordmark. Mark transparan, aman dua tema. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="titip.it, ke halaman utama"
      className={[
        "flex items-center gap-2.5 transition-opacity hover:opacity-80",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src="/logo-mark.png"
        alt=""
        width={44}
        height={35}
        priority
        className="h-8 w-auto"
      />
      <span className="font-mono text-lg font-semibold tracking-tight text-ink">
        titip<span className="text-accent-text">.</span>it
      </span>
    </Link>
  );
}
