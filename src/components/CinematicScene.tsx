import { memo, useEffect, useState } from "react";
import { getVibe } from "@/data/scenes";
import type { AppSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const MOTES = [
  [8, 70], [16, 42], [24, 86], [31, 58], [38, 30], [44, 75],
  [52, 50], [58, 88], [64, 36], [71, 64], [77, 22], [83, 80],
  [89, 48], [94, 68], [12, 18], [48, 14],
] as const;

/** Looping video that fades in over its poster once it can play; on error it
 *  stays transparent so the photographic poster/frames show through. */
function CineVideo({ src, poster }: { src: string; poster?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
  }, [src]);
  return (
    <video
      key={src}
      className={cn("cine-video", ready && "ready")}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      onCanPlay={() => setReady(true)}
      onError={() => setReady(false)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

/**
 * Cinematic landscape. Plays a real looping landscape video per vibe (with the
 * photographic frame as instant poster + offline fallback), inside pointer-
 * parallax depth planes under a Ken Burns dolly. Day/night mood, god rays,
 * drifting fog, motes, grade, grain, vignette. Source + mood are configurable.
 */
export const CinematicScene = memo(function CinematicScene({
  background,
  mood = "day",
  still = false,
}: {
  background: AppSettings["background"];
  mood?: "day" | "night";
  still?: boolean;
}) {
  const kind = background.kind;
  const customUrl = background.url.trim();
  const isCustomVideo = kind === "video" && !!customUrl;
  const isCustomImage = kind === "image" && !!customUrl;
  const isMinimal = kind === "minimal";
  const isCurated = !isCustomVideo && !isCustomImage && !isMinimal;
  const vibe = getVibe(background.vibe);
  const curatedVideo = isCurated && background.useVideo && !!vibe.video;
  const poster = vibe.frames[0]?.url;

  return (
    <div className={cn("cine cine-letterbox", still && "still", mood === "night" && "night")}>
      <div className="cine-base" />

      <div className="cine-plane p-img">
        {isCustomVideo && <CineVideo src={customUrl} />}
        {isCustomImage && (
          <div className="cine-img solo" style={{ backgroundImage: `url("${customUrl}")` }} />
        )}

        {isCurated && curatedVideo && (
          <>
            <div
              className="cine-img solo"
              style={{ backgroundImage: `url("${poster}")`, transformOrigin: vibe.frames[0].origin }}
            />
            <CineVideo src={vibe.video!} poster={poster} />
          </>
        )}
        {isCurated && !curatedVideo &&
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

      <div className="cine-night-overlay" />
      <div className="stars" />
      <div
        className="cine-grade"
        style={isCurated && vibe.grade ? { background: vibe.grade } : undefined}
      />
      <div className="cine-grain" />
      <div className="cine-vignette" />
    </div>
  );
});
