import { memo } from "react";
import { getVibe } from "@/data/scenes";
import type { AppSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

// Fixed mote positions (foreground dust). Deterministic so it's stable.
const MOTES = [
  [8, 70], [16, 42], [24, 86], [31, 58], [38, 30], [44, 75],
  [52, 50], [58, 88], [64, 36], [71, 64], [77, 22], [83, 80],
  [89, 48], [94, 68], [12, 18], [48, 14],
] as const;

/**
 * Cinematic landscape. Photographic frames cross-fade under a Ken Burns dolly
 * inside pointer-parallax depth planes (it reads inherited --mx/--my). Source is
 * configurable: curated set (auto), a custom image, a looping video, or a
 * minimal CSS-only atmosphere. Everything degrades to the base gradient offline.
 */
export const CinematicScene = memo(function CinematicScene({
  background,
  still = false,
}: {
  background: AppSettings["background"];
  still?: boolean;
}) {
  const kind = background.kind;
  const customUrl = background.url.trim();
  const useVideo = kind === "video" && customUrl;
  const useImage = kind === "image" && customUrl;
  const useCurated = kind === "auto" || (!useVideo && !useImage && kind !== "minimal");
  const vibe = getVibe(background.vibe);

  return (
    <div className={cn("cine cine-letterbox", still && "still")}>
      <div className="cine-base" />

      <div className="cine-plane p-img">
        {useVideo && (
          <video
            className="cine-img solo absolute h-full w-full object-cover"
            src={customUrl}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
        {useImage && (
          <div
            className="cine-img solo"
            style={{ backgroundImage: `url("${customUrl}")` }}
          />
        )}
        {useCurated &&
          vibe.frames.map((s, i) => (
            <div
              key={s.url}
              className={cn("cine-img", ["a", "b", "c"][i % 3])}
              style={{ backgroundImage: `url("${s.url}")`, transformOrigin: s.origin }}
            />
          ))}
      </div>

      <div className="cine-plane p-rays">
        <div className="rays" />
      </div>

      <div className="cine-plane p-fog">
        <div className="fog f1" />
        <div className="fog f2" />
      </div>

      <div className="cine-plane p-dust">
        {MOTES.map(([left, top], i) => (
          <span
            key={i}
            className="mote"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${(i % 8) * 1.1}s`,
              animationDuration: `${8 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <div
        className="cine-grade"
        style={useCurated && vibe.grade ? { background: vibe.grade } : undefined}
      />
      <div className="cine-grain" />
      <div className="cine-vignette" />
    </div>
  );
});
