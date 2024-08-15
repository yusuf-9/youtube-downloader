/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: 'var(--primary-main)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        accent: {
          main: 'var(--accent-main)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
        },
        theme: {
          main: 'var(--theme-main)',
          light: 'var(--theme-light)',
          dark: 'var(--theme-dark)',
        },
        themeContrast: {
          main: 'var(--theme-contrast-main)',
          light: 'var(--theme-contrast-light)',
          dark: 'var(--theme-contrast-dark)',
        },
      },
    },
  },
  plugins: [],
}

