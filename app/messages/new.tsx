import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { sendMessage } from '../../lib/services/messageService';
import { Colors, Spacing, Typography } from '../../constants';
import Screen from '../../components/ui/Screen';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useRequireAuth } from '../../lib/useRequireAuth';

export default function NewThreadScreen() {
  const { listingId, sellerId } = useLocalSearchParams<{
    listingId: string;
    sellerId: string;
  }>();
  const auth = useRequireAuth();
  const router = useRouter();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function handleSend(): Promise<void> {
    if (!messageText.trim() || isSending) return;
    setIsSending(true);
    try {
      const newThreadId = await sendMessage(
        auth.userId!,
        listingId,
        messageText.trim(),
      );
      if (newThreadId) {
        router.replace(`/messages/${newThreadId}?listingId=${listingId}`);
        return;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      Sentry.captureException(err);
      Alert.alert(
        'Something went wrong',
        'Could not send your message. Please try again.',
      );
    } finally {
      setIsSending(false);
    }
  }

  if (!auth.ready) {
    return auth.redirect ?? null;
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenHeader title='New Message' onBack={() => router.back()} />

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Send a message to start the conversation.
          </Text>
        </View>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder='Message...'
            placeholderTextColor={Colors.textSecondary}
            multiline
            autoFocus
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || isSending}
            hitSlop={10}
          >
            {isSending ? (
              <ActivityIndicator size='small' color={Colors.accent} />
            ) : (
              <Ionicons
                name='arrow-up'
                size={18}
                color={Colors.backgroundCard}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.textPrimary,
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
