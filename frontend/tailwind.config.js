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
        completedTheme: "#40EDC3",
        darkBackground: "#12112D",
        purpleBorder: "#5454FF",
        purpleMain: "#1E1E39",
        purpleNormal: "#363669",
      },
      backgroundImage: {
        purpleActiveTask: "linear-gradient(to right,#5D5DEA,#212140)",
        purpleSidebar: "linear-gradient(to top,#12112D , #212140 )",
        purpleActive: "linear-gradient(to left,#5D5DEA,#212140)",
        completedTask:"linear-gradient(to right,rgba(48, 232, 155, 0.8) 10%,#363669)",
        failedTask:"linear-gradient(to right,#C51313,#5F0909)",
        mainGradient:"linear-gradient(to left,#1E1E39,#444473)",
        streak:"linear-gradient(to bottom, #FFDA93,#DEA331,#DE6F31,#783C1A)",
        hotterStreak:"linear-gradient(to bottom, #93E8FF,#31B3DE,#3176DE,#1A1F78)",
        hottestStreak:"linear-gradient(to bottom, #D993FF,#9631DE,#7C31DE,#361A78)",
        purpleGradient:"linear-gradient(to right, #6D6DFD, #CE88FA, #6D6DFD)",
        progressGradient:"linear-gradient(to right, #3434B2,#6D6DFD,#CE88FA)"
      },
    },
  },
  variants:{},
  plugins: [],
};
