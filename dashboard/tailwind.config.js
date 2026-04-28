/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/react/dist/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        eden: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        // N243 brand palette mirrored from production EDEN Connect.
        // Prefixed `eden-` (or `navy` standalone) so they don't collide
        // with Tailwind's default `slate`/`teal`/`blue`/`amber` scales,
        // which existing POC pages depend on.
        navy: '#0B2545',
        'eden-blue': '#2F6FB2',
        'eden-mid-blue': '#1E4F8C',
        'eden-teal': '#4FE0C8',
        'eden-white': '#F5F7FA',
        'eden-slate': '#8899AA',
        'eden-pale-blue': '#E8EEF8',
        'eden-amber': '#F5A623',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
