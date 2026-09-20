/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ReelTune Design System Colors
        bgPrimary:   '#080706',
        bgSecondary: '#11100E',
        card:        '#181512',
        cardElevated:'#211B16',
        accent:      '#D99A5B',
        accentLight: '#F0C28F',
        textPrimary: '#F5F1EB',
        textSecondary:'#A9A29A',
        textMuted:   '#6F6A64',
        success:     '#8FBF9A',
        error:       '#D77A70',
      },
      fontFamily: {
        sans: ['Manrope_400Regular'],
        manrope: ['Manrope_400Regular'],
        manropeMedium: ['Manrope_500Medium'],
        manropeSemiBold: ['Manrope_600SemiBold'],
        manropeBold: ['Manrope_700Bold'],
        manropeExtraBold: ['Manrope_800ExtraBold'],
      },
      borderRadius: {
        btn:    '14px',
        card:   '20px',
        artwork:'16px',
        sheet:  '28px',
        input:  '14px',
      },
    },
  },
  plugins: [],
};
