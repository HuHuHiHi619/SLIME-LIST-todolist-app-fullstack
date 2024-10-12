/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: ["./index.html",
     "./index.jsx",
     "./src/**/*.{js,ts,jsx,tsx}",
     "./src/**/*.css"
    ],
  theme: {
    extend: {
      colors: {
        categoryTheme: "#FFD595",
        startDateTheme: "#2D80E2",
        deadlineTheme: "#E22D38",
        pendingdTheme: "#FBA05F",
        completedTheme: "#2BB795",
        darkBackground: "#12112D",
        purpleBorder: "#5555D6",
        purpleMain: "#1E1E39",
        purpleNormal: "#363669",
      },
      backgroundImage: {
        purpleActiveTask: "linear-gradient(to right,#5D5DEA,#212140)",
        purpleActive: "linear-gradient(to left,#5D5DEA,#212140)",
        completedTask:"linear-gradient(to right,#13C57A,#095F3B)",
        mainGradient:"linear-gradient(to left,#1E1E39,#444473)",
        streak:"linear-gradient(to bottom, #FFDA93,#DEA331,#DE6F31,#783C1A)"
      },
    },
  },
  variants:{},
  plugins: [],
};
