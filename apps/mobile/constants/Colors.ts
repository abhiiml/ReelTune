// ReelTune Design System — Colors
// Source of truth: SKILLS.md

export const Colors = {
  bgPrimary:    '#080706',
  bgSecondary:  '#11100E',
  card:         '#181512',
  cardElevated: '#211B16',
  accent:       '#D99A5B',
  accentLight:  '#F0C28F',
  textPrimary:  '#F5F1EB',
  textSecondary:'#A9A29A',
  textMuted:    '#6F6A64',
  success:      '#8FBF9A',
  error:        '#D77A70',
  // Brand integration colors — only for their respective integrations
  spotify:      '#1DB954',
  youtube:      '#FF0000',
} as const;

export type ColorKey = keyof typeof Colors;
