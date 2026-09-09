import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        magenta: {
          DEFAULT: '#c11f5c',
          dark: '#8f1546',
          light: '#e14a80',
        },
        gold: {
          DEFAULT: '#c08a2e',
          light: '#d9ac5c',
        },
        blush: {
          DEFAULT: '#fdf0ef',
          dark: '#f7dcda',
        },
      },
      fontFamily: {
        heading: ['var(--font-poppins)'],
        script: ['var(--font-caveat)'],
        body: ['var(--font-manrope)'],
      },
    },
  },
  plugins: [],
};

export default config;
