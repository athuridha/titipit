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

const arcAnimation = {
  pathLength: [0, 1, 1, 0],
  opacity: [0, 1, 1, 0],
};

const pointAnimation = {
  opacity: [0, 1, 1, 0],
  scale: [0.8, 1.2, 1.2, 0.8],
};

const glowAnimation = {
  pathLength: [0, 1, 1, 0],
  opacity: [0, 0.42, 0.42, 0],
};

/** Satu irama untuk arc, titik, dan glow supaya animasinya sinkron. */
function arcTransition(index: number) {
  return {
    duration: 7,
    delay: 0.3 + index * 0.35,
    times: [0, 0.3, 0.78, 1],
    ease: "easeInOut" as const,
    repeat: Infinity,
    repeatDelay: 0.8,
  };
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

function useLowPowerMode() {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    }).connection;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
    const limitedDevice =
      navigator.hardwareConcurrency <= 4 ||
      (typeof deviceMemory === "number" && deviceMemory <= 4) ||
      connection?.saveData === true;

    setLowPower(media.matches || limitedDevice || isSmallScreen);
  }, []);

  return lowPower;
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
  const lowPower = useLowPowerMode();
  const shouldAnimate = !lowPower;
  const mapSrc = useMemo(() => {
    const map = new DottedMap({ height: lowPower ? 90 : 150, grid: "diagonal" });
    const svg = map.getSVG({
      radius: 0.18,
      color: theme === "dark" ? "#ffffff38" : "#00000038",
      shape: "circle",
      backgroundColor: theme === "dark" ? "#0b0c0e" : "#fbfbfa",
    });
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [lowPower, theme]);

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
                strokeWidth={6}
                filter={undefined}
                opacity={0.42}
                initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
                animate={shouldAnimate ? glowAnimation : undefined}
                transition={shouldAnimate ? arcTransition(i) : undefined}
              />
              <motion.path
                d={d}
                fill="none"
                stroke={lineColor}
                strokeWidth={1.5}
                filter={undefined}
                initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
                animate={shouldAnimate ? arcAnimation : undefined}
                transition={shouldAnimate ? arcTransition(i) : undefined}
              />
              <motion.circle
                cx={s.x}
                cy={s.y}
                r={4}
                fill={lineColor}
                filter={undefined}
                initial={shouldAnimate ? { opacity: 0 } : false}
                animate={shouldAnimate ? pointAnimation : undefined}
                transition={shouldAnimate ? arcTransition(i) : undefined}
              />
              <motion.circle
                cx={e.x}
                cy={e.y}
                r={3}
                fill={lineColor}
                filter={undefined}
                initial={shouldAnimate ? { opacity: 0 } : false}
                animate={shouldAnimate ? pointAnimation : undefined}
                transition={shouldAnimate ? arcTransition(i) : undefined}
              />
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
        {arcs.length > 0 ? (
          <motion.circle
            cx={projectPoint(arcs[0].start.lat, arcs[0].start.lng).x}
            cy={projectPoint(arcs[0].start.lat, arcs[0].start.lng).y}
            r={5}
            fill={lineColor}
            filter={undefined}
            animate={shouldAnimate ? { opacity: [0.55, 1, 0.55], scale: [0.85, 1.3, 0.85] } : undefined}
            transition={shouldAnimate ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : undefined}
          />
        ) : null}
      </svg>
    </div>
  );
}
