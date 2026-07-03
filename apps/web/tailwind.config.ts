import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        pos: {
          orange: "#FE9F43",
          navy: "#092C4C",
          green: "#198754",
          red: "#DC3545",
          amber: "#FFC107",
          bgPage: "#F9FAFB",
          textPrimary: "#212B36",
          textMuted: "#7A8086",
          borderLight: "#E6EAED",
        },
      },
      borderRadius: {
        card: "8px",
      },
      boxShadow: {
        card: "rgba(231, 231, 231, 0.47) 0px 4px 60px 0px",
        kpiOrange: "0px 14px 40px rgba(254, 159, 67, 0.2)",
        kpiNavy: "0px 14px 40px rgba(9, 44, 76, 0.2)",
        kpiGreen: "0px 14px 40px rgba(25, 135, 84, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
