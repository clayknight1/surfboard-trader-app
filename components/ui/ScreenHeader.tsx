import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants';

type ScreenHeaderProps = {
  title?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
};

export default function ScreenHeader({
  title,
  onBack,
  rightElement,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          accessibilityLabel='Go back'
          hitSlop={10}
        >
          <Ionicons name='chevron-back' size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      {title ? (
        <Text
          style={[styles.title, { textAlign: onBack ? 'center' : 'left' }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {rightElement ? (
        <View style={styles.right}>{rightElement}</View>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    height: 56,
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 24,
  },
});
