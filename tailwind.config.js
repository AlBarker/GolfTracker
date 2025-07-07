/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(37.5 36.36% 95.69%)",
        foreground: "hsl(8.89 27.84% 19.02%)",
        card: {
          DEFAULT: "hsl(37.5 36.36% 95.69%)",
          foreground: "hsl(8.89 27.84% 19.02%)",
        },
        popover: {
          DEFAULT: "hsl(37.5 36.36% 95.69%)",
          foreground: "hsl(8.89 27.84% 19.02%)",
        },
        primary: {
          DEFAULT: "hsl(123.04 46.2% 33.53%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(124.62 39.39% 93.53%)",
          foreground: "hsl(124.48 55.37% 23.73%)",
        },
        muted: {
          DEFAULT: "hsl(33.75 34.78% 90.98%)",
          foreground: "hsl(15 25.29% 34.12%)",
        },
        accent: {
          DEFAULT: "hsl(122 37.5% 84.31%)",
          foreground: "hsl(124.48 55.37% 23.73%)",
        },
        destructive: {
          DEFAULT: "hsl(0 66.39% 46.67%)",
          foreground: "hsl(0 0% 100%)",
        },
        border: "hsl(33.91 27.06% 83.33%)",
        input: "hsl(33.91 27.06% 83.33%)",
        ring: "hsl(123.04 46.2% 33.53%)",
        chart: {
          1: "hsl(122.42 39.44% 49.22%)",
          2: "hsl(122.79 43.43% 38.82%)",
          3: "hsl(123.04 46.2% 33.53%)",
          4: "hsl(124.48 55.37% 23.73%)",
          5: "hsl(125.71 51.22% 8.04%)",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        serif: ["Merriweather", "serif"],
        mono: ["Source Code Pro", "monospace"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.5rem",
        sm: "0.5rem",
      },
      boxShadow: {
        "2xs": "0 1px 3px rgba(0, 0, 0, 0.05)",
        xs: "0 1px 3px rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px rgba(0, 0, 0, 0.10)",
        DEFAULT: "0 1px 3px rgba(0, 0, 0, 0.10)",
        md: "0 2px 4px rgba(0, 0, 0, 0.10)",
        lg: "0 4px 6px rgba(0, 0, 0, 0.10)",
        xl: "0 8px 10px rgba(0, 0, 0, 0.10)",
        "2xl": "0 12px 24px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
}

