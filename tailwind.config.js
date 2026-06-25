import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Variable"', "Inter", "system-ui", "sans-serif"],
        mono: ['"Geist Mono Variable"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter2: "-0.03em",
      },
      colors: {
        // Warm "paper" canvas — the Intelly-style friendly light surface
        paper: {
          DEFAULT: "#F4F2EB",
          deep: "#ECEAE1",
          warm: "#F8F6F0",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          2: "#FBFAF6",
          3: "#F3F1EA",
        },
        ink: {
          DEFAULT: "#1B1B17",
          2: "#55544C",
          3: "#8C8A7E",
          4: "#B6B4A8",
        },
        line: {
          DEFAULT: "rgba(27,27,23,0.09)",
          strong: "rgba(27,27,23,0.14)",
        },
        // One confident, non-pink accent — the reference's lemon
        accent: {
          DEFAULT: "#E6FB52",
          deep: "#D2EC2E",
          ink: "#1B1B17",
        },
        // Pastel-but-legible priority system (coral, NOT pink)
        p0: { DEFAULT: "#F0563E", tint: "#FCE6E0", ink: "#9E2C1B" },
        p1: { DEFAULT: "#E8902B", tint: "#FAEAD0", ink: "#965107" },
        p2: { DEFAULT: "#3B8FDE", tint: "#E2EEFB", ink: "#1A5798" },
        p3: { DEFAULT: "#7C8B86", tint: "#E9EDEA", ink: "#4C5854" },
        teal: { DEFAULT: "#179A92", tint: "#DDF1EF" },
        mint: { DEFAULT: "#27A877", tint: "#DBF1E7" },
        sky: { DEFAULT: "#3B8FDE", tint: "#E2EEFB" },
        honey: { DEFAULT: "#E8902B", tint: "#FAEAD0" },
      },
      borderRadius: {
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      boxShadow: {
        // shadow-as-border (Geist technique) + soft ambient lift
        hair: "0 0 0 1px rgba(27,27,23,0.07)",
        card: "0 0 0 1px rgba(27,27,23,0.06), 0 1px 2px rgba(27,27,23,0.04), 0 14px 32px -22px rgba(27,27,23,0.30)",
        lift: "0 0 0 1px rgba(27,27,23,0.06), 0 2px 4px rgba(27,27,23,0.05), 0 26px 50px -28px rgba(27,27,23,0.40)",
        pop: "0 8px 24px -10px rgba(27,27,23,0.30)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16,1,0.3,1)",
        "in-out-smooth": "cubic-bezier(0.65,0,0.35,1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // ── Cinematic scene ──────────────────────────────────────────
        sky: {
          // pan a tall dawn→day→dusk gradient
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-22%)" },
        },
        sun: {
          "0%, 100%": { transform: "translate(-50%, 18%) scale(0.9)", opacity: "0.85" },
          "50%": { transform: "translate(-50%, -26%) scale(1.08)", opacity: "1" },
        },
        "fog-a": {
          "0%": { transform: "translateX(-12%)" },
          "100%": { transform: "translateX(12%)" },
        },
        "fog-b": {
          "0%": { transform: "translateX(10%)" },
          "100%": { transform: "translateX(-14%)" },
        },
        "ridge-drift": {
          "0%": { transform: "translateX(-2.5%)" },
          "100%": { transform: "translateX(2.5%)" },
        },
        "birds": {
          "0%": { transform: "translate(-20%, 10%)", opacity: "0" },
          "10%": { opacity: "0.5" },
          "90%": { opacity: "0.5" },
          "100%": { transform: "translate(120%, -30%)", opacity: "0" },
        },
        grain: {
          "0%,100%": { transform: "translate(0,0)" },
          "25%": { transform: "translate(-3%,2%)" },
          "50%": { transform: "translate(2%,-3%)" },
          "75%": { transform: "translate(-2%,-2%)" },
        },
        // headline clip reveal
        reveal: {
          "0%": { transform: "translateY(110%)" },
          "100%": { transform: "translateY(0)" },
        },
        "bar-grow": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.5s ease both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        sky: "sky 64s ease-in-out infinite",
        sun: "sun 64s ease-in-out infinite",
        "fog-a": "fog-a 26s ease-in-out infinite alternate",
        "fog-b": "fog-b 34s ease-in-out infinite alternate",
        "ridge-drift": "ridge-drift 40s ease-in-out infinite alternate",
        birds: "birds 28s linear infinite",
        grain: "grain 0.6s steps(2) infinite",
        reveal: "reveal 0.9s cubic-bezier(0.16,1,0.3,1) both",
        "bar-grow": "bar-grow 0.8s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [animate],
};
