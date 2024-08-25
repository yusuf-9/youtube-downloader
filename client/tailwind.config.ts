import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: {
          main: "var(--primary-main)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
        },
        accent: {
          main: "var(--accent-main)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)",
        },
        theme: {
          main: "var(--theme-main)",
          light: "var(--theme-light)",
          dark: "var(--theme-dark)",
        },
        "theme-contrast": {
          main: "var(--theme-contrast-main)",
          light: "var(--theme-contrast-light)",
          dark: "var(--theme-contrast-dark)",
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)',  },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
