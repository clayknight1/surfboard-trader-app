import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { getMessages, markThreadRead } from '../../lib/services/messageService';
import { sendMessage } from '../../lib/services/messageService';
import { Colors, Spacing, Typography } from '../../constants';
import Screen from '../../components/ui/Screen';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function ThreadScreen() {
  const { threadId, listingId } = useLocalSearchParams<{
    threadId: string;
    listingId: string;
  }>();
  const { session, refreshUnreadCount } = useAuth();
  const userId = session?.user?.id!;
  const router = useRouter();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();
  const resolvedThreadId = Array.isArray(threadId) ? threadId[0] : threadId;
  const flatListRef = useRef<FlatList>(null);

  const { data: messages, isPending } = useQuery({
    queryKey: ['thread', resolvedThreadId],
    queryFn: () => getMessages(resolvedThreadId!),
    enabled: !!resolvedThreadId,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (resolvedThreadId && userId) {
      markThreadRead(resolvedThreadId, userId).then(() => {
        refreshUnreadCount();
      });
    }
  }, [resolvedThreadId, userId]);

  useEffect(() => {
    if (!resolvedThreadId) return;

    const setupRealtime = async () => {
      await supabase.realtime.setAuth();

      const channel = supabase
        .channel(`topic:${userId}`, { config: { private: true } })
        .on('broadcast', { event: 'INSERT' }, (payload) => {
          const incomingThreadId = payload.payload?.record?.thread_id;
          if (incomingThreadId === resolvedThreadId) {
            queryClient.invalidateQueries({
              queryKey: ['thread', resolvedThreadId],
            });
          }
        })
        .subscribe();

      return channel;
    };

    let channel: any;
    setupRealtime().then((c) => (channel = c));

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [resolvedThreadId]);

  async function handleSend() {
    if (!messageText.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(
        userId,
        listingId,
        messageText.trim(),
        resolvedThreadId,
      );
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['thread', resolvedThreadId] });
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name='chevron-back'
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conversation</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Messages */}
        {isPending ? (
          <ActivityIndicator style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            ref={flatListRef}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) => {
              const isMe = item.sender_id === userId;
              return (
                <View
                  style={[
                    styles.bubbleWrapper,
                    isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperThem,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isMe ? styles.bubbleMe : styles.bubbleThem,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isMe ? styles.bubbleTextMe : styles.bubbleTextThem,
                      ]}
                    >
                      {item.body}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder='Message...'
            placeholderTextColor={Colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size='small' color={Colors.backgroundCard} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  messageList: {
    padding: Spacing.screenPadding,
    gap: Spacing.sm,
  },
  bubbleWrapper: {
    flexDirection: 'row',
  },
  bubbleWrapperMe: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperThem: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bubbleMe: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.backgroundSubtle,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    ...Typography.body,
  },
  bubbleTextMe: {
    color: Colors.backgroundCard,
  },
  bubbleTextThem: {
    color: Colors.textPrimary,
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
