// Curated, free-to-use (Unsplash license) cinematic landscapes. The hero
// cross-fades through these with a slow Ken Burns dolly so the scene reads as a
// living video rather than a still. Hotlinked from Unsplash's CDN; if offline,
// the CinematicScene degrades to its CSS atmosphere layer.

const U = (id: string, w = 2400) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export interface Scene {
  url: string;
  /** transform-origin for this frame's Ken Burns, for variety */
  origin: string;
  credit: string;
}

export const CURATED_SCENES: Scene[] = [
  { url: U("photo-1470071459604-3b5ec3a7fe05"), origin: "60% 40%", credit: "Sebastian Unrau" },
  { url: U("photo-1483728642387-6c3bdd6c93e5"), origin: "40% 55%", credit: "Kalen Emsley" },
  { url: U("photo-1506905925346-21bda4d32df4"), origin: "55% 45%", credit: "Kalen Emsley" },
];

// Low-res preview of the first frame to paint instantly while the full image loads.
export const FIRST_PREVIEW = U("photo-1470071459604-3b5ec3a7fe05", 64);
