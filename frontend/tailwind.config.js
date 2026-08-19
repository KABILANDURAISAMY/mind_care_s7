/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // MindCare design tokens — a grounded, campus-at-dusk palette.
        // Deliberately avoids the generic "cream + terracotta" AI-default.
        pine: {
          DEFAULT: "#1F3D3B", // deep teal-green — headers, dark surfaces
          light: "#2B534F",
          dark: "#152C2A",
        },
        sage: {
          DEFAULT: "#7FA895", // calm secondary accent
          light: "#A9C7B8",
          dark: "#5C8571",
        },
        mist: {
          DEFAULT: "#F2F4EF", // warm-cool off-white background
          dark: "#E7EBE2",
        },
        sunrise: {
          DEFAULT: "#D9A441", // primary accent / CTA — a new-day gold
          light: "#EAC272",
          dark: "#B9862C",
        },
        dusk: {
          DEFAULT: "#6E8FA3", // secondary accent — links, info states
          light: "#94AFC0",
          dark: "#516F82",
        },
        ink: "#1B2620", // body text
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Karla'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 24px -6px rgba(31, 61, 59, 0.12)",
        card: "0 2px 12px -2px rgba(31, 61, 59, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.18)", opacity: "1" },
        },
        breatheOuter: {
          "0%, 100%": { transform: "scale(0.92)", opacity: "0.35" },
          "50%": { transform: "scale(1.3)", opacity: "0.05" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        breathe: "breathe 6s ease-in-out infinite",
        breatheOuter: "breatheOuter 6s ease-in-out infinite",
        rise: "rise 0.7s ease-out both",
      },
    },
  },
  plugins: [],
};
