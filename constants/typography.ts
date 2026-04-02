const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
};

export const Typography = {
  // Font families
  fontRegular: fontFamily.regular,
  fontMedium: fontFamily.medium,
  fontSemibold: fontFamily.semibold,
  fontBold: fontFamily.bold,
  fontMono: fontFamily.mono,
  fontMonoBold: fontFamily.monoBold,

  // Font sizes
  size10: 10,
  size12: 12,
  size13: 13,
  size14: 14,
  size16: 16,
  size18: 18,
  size20: 20,
  size24: 24,
  size28: 28,
  size32: 32,

  // Font weights
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemibold: '600' as const,
  weightBold: '700' as const,

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.7,

  // Semantic text styles
  displayLarge: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
  },
  displaySmall: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  heading: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  subheading: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
  spec: {
    fontFamily: fontFamily.mono,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  specLarge: {
    fontFamily: fontFamily.monoBold,
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
};
