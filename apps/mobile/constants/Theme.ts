// ReelTune Design System — Theme Constants
// Source of truth: SKILLS.md

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  base:16,
  lg:  24,
  xl:  32,
  '2xl':40,
  '3xl':48,
  '4xl':64,
} as const;

export const Radius = {
  btn:    14,
  card:   20,
  artwork:16,
  sheet:  28,
  input:  14,
} as const;

// px sizes — for React Native StyleSheet use
export const Typography = {
  display: { fontSize: 42, fontFamily: 'Manrope_700Bold' },
  h1:      { fontSize: 32, fontFamily: 'Manrope_700Bold' },
  h2:      { fontSize: 24, fontFamily: 'Manrope_600SemiBold' },
  h3:      { fontSize: 18, fontFamily: 'Manrope_600SemiBold' },
  body:    { fontSize: 15, fontFamily: 'Manrope_400Regular' },
  small:   { fontSize: 13, fontFamily: 'Manrope_500Medium' },
  caption: { fontSize: 11, fontFamily: 'Manrope_500Medium' },
} as const;

export type SpacingKey  = keyof typeof Spacing;
export type RadiusKey   = keyof typeof Radius;
export type TypographyKey = keyof typeof Typography;
