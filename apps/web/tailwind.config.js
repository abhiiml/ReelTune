/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: '#080706',
        bgSecondary: '#11100E',
        card: '#181512',
        cardElevated: '#211B16',
        accent: '#D99A5B',
        accentLight: '#F0C28F',
        textPrimary: '#F5F1EB',
        textSecondary: '#A9A29A',
        textMuted: '#6F6A64',
        success: '#8FBF9A',
        error: '#D77A70',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
      borderRadius: {
        btn: '14px',
        card: '20px',
        artwork: '16px',
        sheet: '28px',
        input: '14px',
      },
    },
  },
  plugins: [],
};
