import { memo } from "react";

/**
 * A self-contained cinematic dawn→day vista built entirely from CSS + SVG —
 * no images, no video, no external assets. Layered parallax ridges, drifting
 * fog banks, a rising sun, framing firs, film grain and a vignette. It animates
 * continuously and scales to fill whatever (relatively-positioned) box holds it,
 * so the same element works full-bleed on the landing and as the rounded
 * dashboard banner after the pull-back.
 */
export const CinematicScene = memo(function CinematicScene() {
  return (
    <div className="scene">
      <div className="scene-sky" />
      <div className="scene-sun" />

      {/* parallax ridgelines */}
      <svg
        className="scene-ridges"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <path
          fill="#6f879a"
          d="M0,430 L150,372 L300,408 L470,338 L640,396 L820,344 L1000,404 L1180,352 L1360,412 L1520,360 L1600,392 L1600,900 L0,900 Z"
        />
        <path
          fill="#56768a"
          opacity="0.96"
          d="M0,500 L180,452 L360,492 L540,430 L720,486 L900,440 L1080,492 L1260,446 L1440,498 L1600,452 L1600,900 L0,900 Z"
        />
        <path
          fill="#3c5b66"
          d="M0,580 L160,548 L340,586 L520,532 L700,584 L880,540 L1060,588 L1240,544 L1420,590 L1600,552 L1600,900 L0,900 Z"
        />
        <path
          fill="#274149"
          d="M0,672 L200,640 L420,680 L640,628 L860,682 L1080,636 L1300,684 L1520,640 L1600,664 L1600,900 L0,900 Z"
        />
      </svg>

      {/* drifting fog banks */}
      <div className="scene-fog f1" />
      <div className="scene-fog f2" />
      <div className="scene-fog f3" />

      {/* foreground framing firs + near hill */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <path fill="#152529" d="M0,760 L300,724 L640,772 L1000,720 L1340,772 L1600,732 L1600,900 L0,900 Z" />
        {/* left fir */}
        <g fill="#0f1f22">
          <rect x="150" y="300" width="14" height="430" />
          <path d="M157,250 L208,420 L106,420 Z" />
          <path d="M157,330 L226,520 L88,520 Z" />
          <path d="M157,420 L246,640 L68,640 Z" />
        </g>
        {/* right fir (smaller) */}
        <g fill="#0f1f22">
          <rect x="1414" y="380" width="11" height="360" />
          <path d="M1419,344 L1462,470 L1376,470 Z" />
          <path d="M1419,410 L1478,560 L1360,560 Z" />
          <path d="M1419,486 L1494,656 L1344,656 Z" />
        </g>
      </svg>

      <div className="scene-grain" />
      <div className="scene-vignette" />
    </div>
  );
});
