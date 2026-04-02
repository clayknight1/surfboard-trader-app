const palette = {
  // Base
  black: '#0A0A0A',
  white: '#FFFFFF',

  // Neutrals
  neutral50: '#F5F5F5',
  neutral100: '#E8E8E8',
  neutral200: '#D0D0D0',
  neutral400: '#888888',
  neutral600: '#444444',
  neutral800: '#1A1A1A',
  neutral900: '#111111',

  // Blue accent
  blue300: '#60A5FA',
  blue400: '#3B82F6',
  blue500: '#2563EB',
  blue600: '#1D4ED8',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const Colors = {
  // Backgrounds
  background: palette.black,
  backgroundCard: palette.white,
  backgroundSubtle: palette.neutral800,
  backgroundInput: palette.neutral800,

  // Text
  textPrimary: palette.neutral50,
  textSecondary: palette.neutral400,
  textInverse: palette.black,
  textOnCard: palette.black,
  textOnCardMuted: palette.neutral600,

  // Accent
  accent: palette.blue400,
  accentLight: palette.blue300,
  accentDark: palette.blue600,

  // UI
  border: palette.neutral800,
  borderCard: palette.neutral100,
  sponsored: palette.warning,

  // Status
  success: palette.success,
  warning: palette.warning,
  error: palette.error,

  // Condition colors
  conditionExcellent: palette.success,
  conditionGood: '#84CC16',
  conditionFair: palette.warning,
  conditionPoor: palette.error,
};
