/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary, #1E3A8A)",
          secondary: "var(--brand-secondary, #F59E0B)",
          accent: "var(--brand-accent, #10B981)",
          surface: "var(--brand-surface, #0F172A)",
        }
      }
    },
  },
  plugins: [],
};
