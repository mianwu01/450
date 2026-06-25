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
        // Neutrals are CSS-variable backed so the whole app flips day ⇄ night.
        paper: {
          DEFAULT: "rgb(var(--c-paper) / <alpha-value>)",
          deep: "rgb(var(--c-paper-deep) / <alpha-value>)",
          warm: "rgb(var(--c-paper-warm) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--c-surface) / <alpha-value>)",
          2: "rgb(var(--c-surface-2) / <alpha-value>)",
          3: "rgb(var(--c-surface-3) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          2: "rgb(var(--c-ink-2) / <alpha-value>)",
          3: "rgb(var(--c-ink-3) / <alpha-value>)",
          4: "rgb(var(--c-ink-4) / <alpha-value>)",
        },
        line: {
          DEFAULT: "var(--c-line)",
          strong: "var(--c-line-strong)",
        },
        // One confident, non-pink accent — the reference's lemon (static both themes)
        accent: { DEFAULT: "#E6FB52", deep: "#D2EC2E", ink: "#1B1B17" },
        // Priority system — vivid base is static; tint/ink flip per theme.
        p0: { DEFAULT: "#F0563E", tint: "var(--p0-tint)", ink: "var(--p0-ink)" },
        p1: { DEFAULT: "#E8902B", tint: "var(--p1-tint)", ink: "var(--p1-ink)" },
        p2: { DEFAULT: "#3B8FDE", tint: "var(--p2-tint)", ink: "var(--p2-ink)" },
        p3: { DEFAULT: "#7C8B86", tint: "var(--p3-tint)", ink: "var(--p3-ink)" },
        teal: { DEFAULT: "#179A92", tint: "var(--teal-tint)" },
        mint: { DEFAULT: "#27A877", tint: "var(--mint-tint)" },
        sky: { DEFAULT: "#3B8FDE", tint: "var(--sky-tint)" },
        honey: { DEFAULT: "#E8902B", tint: "var(--honey-tint)" },
      },
      borderRadius: {
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      boxShadow: {
        // shadow-as-border (Geist technique) + soft ambient lift; flips per theme
        hair: "var(--shadow-hair)",
        card: "var(--shadow-card)",
        lift: "var(--shadow-lift)",
        pop: "var(--shadow-pop)",
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
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "bar-grow": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.5s ease both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "bar-grow": "bar-grow 0.8s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [animate],
};
