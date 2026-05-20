/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.jsx",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      // ─────────────────────────────────────────────────────────────────
      // KEYFRAMES
      // Existing desktop animations are preserved exactly as-is.
      // Mobile drawer / modal animations added below (Task 1a).
      // ─────────────────────────────────────────────────────────────────
      keyframes: {
        // -- Desktop (existing — do not modify) --
        // fade-to-green and fade-from-green removed: were identical keyframes
        // with zero usages across the entire codebase.
        "fade-out": {
          "0%":   { opacity: "1", transform: "translateX(0)" },
          "50%":  { opacity: "0.5", transform: "translateX(15px)" },
          "100%": { opacity: "0", transform: "translateX(30px)" },
        },

        // -- Mobile UI animations (Task 1a) --
        "slime-slidein": {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(0)" },
        },
        "slime-fadein": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slime-popin": {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },

      // ─────────────────────────────────────────────────────────────────
      // ANIMATIONS
      // Existing desktop animations are preserved exactly as-is.
      // Mobile animation helpers added below (Task 1a).
      // ─────────────────────────────────────────────────────────────────
      animation: {
        // -- Desktop (existing — do not modify) --
        "fade-out": "fade-out 0.3s ease-in-out forwards",

        // -- Mobile UI animations (Task 1a) --
        "slime-slidein": "slime-slidein 0.22s cubic-bezier(.32,.72,0,1)",
        "slime-fadein":  "slime-fadein 0.18s ease-out",
        "slime-popin":   "slime-popin 0.18s cubic-bezier(.32,.72,0,1)",
      },

      // ─────────────────────────────────────────────────────────────────
      // COLORS
      // Desktop palette is preserved exactly as-is.
      // Mobile design tokens live in the nested `slime` object (Task 1a).
      // Nested syntax produces: bg-slime-bg, text-slime-muted,
      // border-slime-border, border-slime-border-2, etc.
      // ─────────────────────────────────────────────────────────────────
      colors: {
        // -- Desktop palette (existing — do not modify) --
        categoryTheme:  "#FFD595",
        startDateTheme: "#2D80E2",
        deadlineTheme:  "#E22D38",
        pendingdTheme:  "#FBA05F",
        completedTheme: "#40EDC3",
        darkBackground: "#12112D",
        purpleBorder:   "#5454FF",
        purpleMain:     "#1E1E39",
        purpleNormal:   "#363669",

        // -- Mobile design tokens (Task 1a) --
        // Background layers
        slime: {
          bg:        "#12112D", // page background  (= darkBackground)
          "bg-2":    "#1A1936", // raised surface
          card:      "#1E1E39", // card fill         (= purpleMain)
          "card-2":  "#22223C",
          surface:   "#2A2A4A",
          // Borders
          border:    "#36366F", // primary stroke — dim
          "border-2":"#9999E3", // primary stroke — active / focus
          "border-3":"#6D6DFD", // input focus ring
          // Text
          muted:     "#9999E3", // body text on dark
          "muted-2": "#919191",
          // Accent colours
          pink:      "#E37DDE",
          "pink-2":  "#B45CFF",
          blue:      "#6464FF",
          "blue-2":  "#5555D6",
          amber:     "#DEA331",
          "amber-2": "#DE6F31",
          green:     "#2BB795",
          red:       "#E22D38",
          purple:    "#7C5CFF",
          "purple-2":"#A66BFF",
        },
      },

      // ─────────────────────────────────────────────────────────────────
      // BACKGROUND IMAGES (existing — do not modify)
      // ─────────────────────────────────────────────────────────────────
      backgroundImage: {
        purpleActiveTask: "linear-gradient(to right,#5D5DEA,#212140)",
        purpleSidebar:    "linear-gradient(to top,#12112D , #212140 )",
        purpleNavbar:     "linear-gradient(to left,#12112D , #212140 )",
        purpleActive:     "linear-gradient(to left,#5D5DEA,#212140)",
        completedTask:    "linear-gradient(to right,rgba(48, 232, 155, 0.8) 10%,#363669)",
        failedTask:       "linear-gradient(to right,#C51313,#5F0909)",
        mainGradient:     "linear-gradient(to left,#1E1E39,#444473)",
        streak:           "linear-gradient(to bottom, #FFDA93,#DEA331,#DE6F31,#783C1A)",
        hotterStreak:     "linear-gradient(to bottom, #93E8FF,#31B3DE,#3176DE,#1A1F78)",
        hottestStreak:    "linear-gradient(to bottom, #D993FF,#9631DE,#7C31DE,#361A78)",
        purpleGradient:   "linear-gradient(to right, #6D6DFD, #CE88FA, #6D6DFD)",
        progressGradient: "linear-gradient(to right, #3434B2,#6D6DFD,#CE88FA)",
      },

      // ─────────────────────────────────────────────────────────────────
      // FONT FAMILY (Task 1a)
      // font-display → Jockey One. Already loaded via <link> in index.html.
      // ─────────────────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Jockey One"', "system-ui", "sans-serif"],
      },

      // ─────────────────────────────────────────────────────────────────
      // BOX SHADOWS (Task 1a)
      // ─────────────────────────────────────────────────────────────────
      boxShadow: {
        "slime-card":   "0 4px 12px rgba(0,0,0,0.4)",
        "slime-purple": "0 4px 14px rgba(124,92,255,0.45)",
        "slime-glow":   "0 0 24px rgba(153,153,227,0.2)",
      },
    },
  },
  plugins: [],
};
