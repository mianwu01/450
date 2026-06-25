// Curated, free-to-use (Unsplash license) cinematic landscapes, grouped into
// switchable "vibes". The hero cross-fades through a vibe's frames under a slow
// Ken Burns dolly so it reads as living video. Frames were picked by eye from
// Unsplash search results; all verified to resolve. Hotlinked from Unsplash's
// CDN — offline, the CinematicScene degrades to its CSS atmosphere layer.

const U = (id: string, w = 2400) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export interface Scene {
  url: string;
  /** transform-origin for this frame's Ken Burns, for variety */
  origin: string;
}

export interface Vibe {
  id: string;
  label: string;
  emoji: string;
  frames: Scene[];
  /** optional looping landscape video (poster = first frame) */
  video?: string;
  /** optional cinematic colour-grade overlay tuned to the mood */
  grade?: string;
}

// Direct, hotlinkable Pexels CDN renditions (Pexels license — free to use).
// Each is a verified landscape loop; the first photo frame is the poster.
const PX = (id: string, file: string) =>
  `https://videos.pexels.com/video-files/${id}/${file}.mp4`;

export const VIBES: Vibe[] = [
  {
    id: "forest",
    label: "Forest Dawn",
    emoji: "🌲",
    video: PX("32313069", "13781248_1920_1080_60fps"),
    frames: [
      { url: U("photo-1470071459604-3b5ec3a7fe05"), origin: "60% 40%" },
      { url: U("photo-1483728642387-6c3bdd6c93e5"), origin: "40% 55%" },
      { url: U("photo-1506905925346-21bda4d32df4"), origin: "55% 45%" },
    ],
  },
  {
    id: "snowy",
    label: "Snowy Peaks",
    emoji: "🏔️",
    video: PX("35488888", "15034641_2560_1440_30fps"),
    frames: [
      { url: U("photo-1483921020237-2ff51e8e4b22"), origin: "55% 40%" },
      { url: U("photo-1512273222628-4daea6e55abb"), origin: "45% 50%" },
      { url: U("photo-1454496522488-7a8e488e8606"), origin: "60% 45%" },
    ],
    grade: "linear-gradient(180deg, rgba(22,44,66,0.30) 0%, rgba(40,56,78,0.18) 100%)",
  },
  {
    id: "aurora",
    label: "Aurora",
    emoji: "🌌",
    video: PX("28492331", "12397894_3840_2160_24fps"),
    frames: [
      { url: U("photo-1483347756197-71ef80e95f73"), origin: "50% 35%" },
      { url: U("photo-1507272931001-fc06c17e4f43"), origin: "55% 45%" },
      { url: U("photo-1475518845976-0fd87b7e4e5d"), origin: "45% 40%" },
    ],
    grade: "linear-gradient(180deg, rgba(8,18,32,0.5) 0%, rgba(20,10,38,0.34) 100%)",
  },
  {
    id: "desert",
    label: "Desert Dunes",
    emoji: "🏜️",
    video: PX("33665977", "14303046_3840_2160_30fps"),
    frames: [
      { url: U("photo-1511860810434-a92f84c6f01e"), origin: "55% 50%" },
      { url: U("photo-1506147854445-5a3f534191f8"), origin: "60% 55%" },
      { url: U("photo-1553796661-17b7fa359f49"), origin: "45% 50%" },
    ],
    grade: "linear-gradient(180deg, rgba(64,42,18,0.26) 0%, rgba(44,22,8,0.22) 100%)",
  },
  {
    id: "ocean",
    label: "Ocean Cliffs",
    emoji: "🌊",
    video: PX("32322689", "13787256_1920_1080_30fps"),
    frames: [
      { url: U("photo-1637548076375-32e22046c637"), origin: "50% 45%" },
      { url: U("photo-1433190152045-5a94184895da"), origin: "55% 50%" },
      { url: U("photo-1606312563142-6647e31eaf6b"), origin: "45% 55%" },
    ],
    grade: "linear-gradient(180deg, rgba(14,46,58,0.30) 0%, rgba(10,30,46,0.22) 100%)",
  },
];

export const DEFAULT_VIBE = "forest";

export function getVibe(id: string): Vibe {
  return VIBES.find((v) => v.id === id) ?? VIBES[0];
}

/** Small thumbnail of a vibe's first frame, for the picker. */
export function vibeThumb(v: Vibe): string {
  return `${v.frames[0].url.split("?")[0]}?w=160&h=110&fit=crop&q=60&auto=format`;
}
