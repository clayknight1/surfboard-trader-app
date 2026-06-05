import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants';

type ErrorStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  subtitle?: string;
  retry?: () => void;
  onBack?: () => void;
};

export default function ErrorState({
  icon = 'alert-circle-outline',
  title = 'Something went wrong',
  subtitle = "We couldn't load this. Check your connection and try again.",
  retry,
  onBack,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityLabel='Go back'
          hitSlop={10}
        >
          <Ionicons name='chevron-back' size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <Ionicons name={icon} size={48} color={Colors.textSecondary} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {retry && (
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: Spacing.screenPadding,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
  },
  title: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    ...Typography.body,
    fontFamily: Typography.fontMedium,
    color: Colors.backgroundCard,
  },
});
