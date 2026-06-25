import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "JetBrains Mono",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        // Deep space command-center palette
        ink: {
          950: "#06070d",
          900: "#0a0c16",
          800: "#0f1220",
          700: "#161a2c",
          600: "#1d2236",
          500: "#272d45",
        },
        line: "rgba(255,255,255,0.08)",
        // Priority accent system
        p0: { DEFAULT: "#ff4d6d", soft: "rgba(255,77,109,0.14)" },
        p1: { DEFAULT: "#ff9f43", soft: "rgba(255,159,67,0.14)" },
        p2: { DEFAULT: "#4dabf7", soft: "rgba(77,171,247,0.14)" },
        p3: { DEFAULT: "#868e96", soft: "rgba(134,142,150,0.12)" },
        accent: { DEFAULT: "#7c5cff", soft: "rgba(124,92,255,0.15)" },
        mint: "#2dd4bf",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,92,255,0.25), 0 8px 40px -12px rgba(124,92,255,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(1200px 600px at 70% -10%, rgba(124,92,255,0.18), transparent 60%), radial-gradient(900px 500px at 10% 10%, rgba(45,212,191,0.10), transparent 55%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(124,92,255,0.5)" },
          "70%": { boxShadow: "0 0 0 10px rgba(124,92,255,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(124,92,255,0)" },
        },
        "bar-grow": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.4s ease both",
        shimmer: "shimmer 1.6s infinite",
        "pulse-ring": "pulse-ring 2s infinite",
        "bar-grow": "bar-grow 0.7s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [animate],
};
