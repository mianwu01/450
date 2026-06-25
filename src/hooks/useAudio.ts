import { useEffect, useRef, useState } from "react";

/**
 * Background-music controller. Browsers block autoplay-with-sound until a user
 * gesture, so playback starts on the first interaction once enabled. Returns the
 * live playing state and a manual toggle for the speaker button.
 */
export function useAudio(opts: { enabled: boolean; url: string; volume: number }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [armed, setArmed] = useState(false);

  // Lazily create the element.
  if (!ref.current && typeof Audio !== "undefined") {
    const a = new Audio();
    a.loop = true;
    a.preload = "none";
    ref.current = a;
  }

  // Apply source + volume.
  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    if (a.src !== opts.url) a.src = opts.url;
    a.volume = Math.max(0, Math.min(1, opts.volume));
  }, [opts.url, opts.volume]);

  // Arm on the first user gesture so a later enable can actually play.
  useEffect(() => {
    if (armed) return;
    const arm = () => setArmed(true);
    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [armed]);

  // Drive play/pause from settings + armed state.
  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    if (opts.enabled && opts.url && armed) {
      a.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      a.pause();
      setPlaying(false);
    }
  }, [opts.enabled, opts.url, opts.volume, armed]);

  useEffect(() => {
    return () => {
      ref.current?.pause();
    };
  }, []);

  function toggle() {
    const a = ref.current;
    if (!a || !opts.url) return;
    setArmed(true);
    if (a.paused) {
      a.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  return { playing, toggle, hasTrack: !!opts.url };
}
