import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { PushPermissionStatus } from '../../lib/services/pushService';

type Props = {
  visible: boolean;
  permission: PushPermissionStatus;
  onEnable: () => Promise<void> | void;
  onDismiss: () => void;
  message?: string;
};

const DEFAULT_MESSAGE =
  'Get a push when someone messages you about a board so you can reply fast.';

export default function PushPrePrompt({
  visible,
  permission,
  onEnable,
  onDismiss,
  message,
}: Props) {
  const insets = useSafeAreaInsets();
  const isDenied = permission === 'denied';

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
          ]}
        >
          <View style={styles.iconWrap}>
            <Ionicons
              name='notifications-outline'
              size={44}
              color={Colors.accent}
            />
          </View>
          <Text style={styles.title}>Stay in the loop</Text>
          <Text style={styles.message}>{message ?? DEFAULT_MESSAGE}</Text>
          <TouchableOpacity style={styles.enableButton} onPress={onEnable}>
            <Text style={styles.enableButtonText}>
              {isDenied ? 'Open Settings' : 'Enable notifications'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            hitSlop={10}
          >
            <Text style={styles.dismissText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  enableButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  enableButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
  dismissButton: {
    paddingVertical: Spacing.sm,
  },
  dismissText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
