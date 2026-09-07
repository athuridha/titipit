"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";

export type MapPoint = { lat: number; lng: number; label?: string };
export type MapArc = { start: MapPoint; end: MapPoint };

/** Proyeksi equirectangular — selaras dengan grid dotted-map (800×400). */
function projectPoint(lat: number, lng: number) {
  return { x: ((lng + 180) * 800) / 360, y: ((90 - lat) * 400) / 180 };
}

/** Lengkung kuadratik yang melengkung ke atas di antara dua titik. */
function curvedPath(start: MapPoint, end: MapPoint) {
  const s = projectPoint(start.lat, start.lng);
  const e = projectPoint(end.lat, end.lng);
  const mx = (s.x + e.x) / 2;
  const my = Math.min(s.y, e.y) - Math.hypot(e.x - s.x, e.y - s.y) * 0.22;
  return { d: `M ${s.x} ${s.y} Q ${mx} ${my} ${e.x} ${e.y}`, s, e };
}

function useSiteTheme(forced?: "dark" | "light") {
  const [theme, setTheme] = useState<"dark" | "light">(forced ?? "dark");
  useEffect(() => {
    if (forced) {
      setTheme(forced);
      return;
    }
    const read = () =>
      setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [forced]);
  return theme;
}

/**
 * Peta dunia titik-titik ala Aceternity: generate programatik via
 * dotted-map + garis lengkung animasi + label kota. Sadar tema
 * terang/gelap mengikuti atribut data-theme situs.
 */
export function WorldMap({
  arcs = [],
  lineColor = "#5b8cff",
  className,
  theme: themeProp,
}: {
  arcs?: MapArc[];
  lineColor?: string;
  className?: string;
  theme?: "dark" | "light";
}) {
  const theme = useSiteTheme(themeProp);

  const mapSrc = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    const svg = map.getSVG({
      radius: 0.22,
      color: theme === "dark" ? "#ffffff38" : "#00000038",
      shape: "circle",
      backgroundColor: theme === "dark" ? "#0b0c0e" : "#fbfbfa",
    });
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [theme]);

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mapSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="h-auto w-full select-none"
      />
      <svg
        viewBox="0 0 800 400"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        {arcs.map((arc, i) => {
          const { d, s, e } = curvedPath(arc.start, arc.end);
          return (
            <g key={`${arc.start.label}-${arc.end.label}-${i}`}>
              <motion.path
                d={d}
                fill="none"
                stroke={lineColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.8, delay: 0.3 + i * 0.35, ease: "easeOut" }}
              />
              <motion.circle
                cx={s.x}
                cy={s.y}
                r={4}
                fill={lineColor}
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
              />
              <circle cx={e.x} cy={e.y} r={3} fill={lineColor} opacity={0.9} />
              {arc.start.label ? (
                <text
                  x={s.x + 8}
                  y={s.y - 8}
                  fontSize={13}
                  fontFamily="monospace"
                  fill={theme === "dark" ? "#c3c8cd" : "#33383f"}
                >
                  {arc.start.label}
                </text>
              ) : null}
              {arc.end.label ? (
                <text
                  x={e.x + 8}
                  y={e.y - 8}
                  fontSize={13}
                  fontFamily="monospace"
                  fill={theme === "dark" ? "#c3c8cd" : "#33383f"}
                >
                  {arc.end.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
