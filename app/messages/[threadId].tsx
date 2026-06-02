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
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth';
import {
  getMessages,
  markThreadRead,
  sendMessage,
} from '../../lib/services/messageService';
import { Colors, Spacing, Typography } from '../../constants';
import Screen from '../../components/ui/Screen';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { blockUser, submitReport } from '../../lib/services/blockService';
import * as Haptics from 'expo-haptics';
import * as Sentry from '@sentry/react-native';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useRequireAuth } from '../../lib/useRequireAuth';

type ReportReason = 'spam' | 'inappropriate' | 'scam' | 'other';

export default function ThreadScreen() {
  const { threadId, listingId } = useLocalSearchParams<{
    threadId: string;
    listingId: string;
  }>();
  const auth = useRequireAuth();
  const { refreshUnreadCount } = useAuth();
  const router = useRouter();
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();
  const resolvedThreadId = Array.isArray(threadId) ? threadId[0] : threadId;
  const flatListRef = useRef<FlatList>(null);

  const { data: messages, isPending } = useQuery({
    queryKey: ['thread', resolvedThreadId],
    queryFn: () => getMessages(resolvedThreadId!),
    enabled: !!resolvedThreadId,
    refetchOnWindowFocus: true,
  });

  const otherUserId = messages?.[0]
    ? messages[0].sender_id === auth.userId
      ? messages[0].recipient_id
      : messages[0].sender_id
    : null;

  useEffect(() => {
    if (resolvedThreadId && auth.userId) {
      markThreadRead(resolvedThreadId, auth.userId)
        .then(() => {
          refreshUnreadCount();
        })
        .catch((err) => Sentry.captureException(err));
    }
  }, [resolvedThreadId, auth.userId]);

  useEffect(() => {
    if (!resolvedThreadId) return;

    const setupRealtime = async () => {
      await supabase.realtime.setAuth();

      const channel = supabase
        .channel(`topic:${auth.userId}`, { config: { private: true } })
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

  const sendMessageMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!resolvedThreadId) throw new Error('Missing thread ID');
      await sendMessage(auth.userId!, listingId, body, resolvedThreadId);
    },
    onSuccess: () => {
      setMessageText('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['thread', resolvedThreadId] });
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (err) => {
      Sentry.captureException(err);
      Alert.alert(
        'Something went wrong',
        'Could not send your message. Please try again.',
      );
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async (blockedId: string) => {
      await blockUser(auth.userId!, blockedId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      router.back();
    },
    onError: (err) => {
      Sentry.captureException(err);
      Alert.alert('Something went wrong', 'Could not block user.');
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async ({
      reason,
      reportedUserId,
    }: {
      reason: ReportReason;
      reportedUserId: string;
    }) => {
      await submitReport(auth.userId!, reason, reportedUserId);
    },
    onSuccess: () => {
      Alert.alert('Report submitted', 'Thanks — our team will review this.');
    },
    onError: (err) => {
      Sentry.captureException(err);
    },
  });

  function handleBlock() {
    if (!otherUserId) return;
    Alert.alert(
      'Block User?',
      "They will no longer be able to message you and you won't see their listings.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => blockUserMutation.mutate(otherUserId),
        },
      ],
    );
  }

  function handleSend() {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    sendMessageMutation.mutate(trimmed);
  }

  function handleReport() {
    if (!otherUserId) return;
    Alert.alert('Report User', 'Why are you reporting this user?', [
      {
        text: 'Spam',
        onPress: () =>
          submitReportMutation.mutate({
            reason: 'spam',
            reportedUserId: otherUserId,
          }),
      },
      {
        text: 'Inappropriate behavior',
        onPress: () =>
          submitReportMutation.mutate({
            reason: 'inappropriate',
            reportedUserId: otherUserId,
          }),
      },
      {
        text: 'Scam',
        onPress: () =>
          submitReportMutation.mutate({
            reason: 'scam',
            reportedUserId: otherUserId,
          }),
      },
      {
        text: 'Other',
        onPress: () =>
          submitReportMutation.mutate({
            reason: 'other',
            reportedUserId: otherUserId,
          }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleMenu() {
    Alert.alert('Options', undefined, [
      {
        text: 'Report User',
        onPress: handleReport,
      },
      {
        text: 'Block User',
        style: 'destructive',
        onPress: handleBlock,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
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
        <ScreenHeader
          title='Conversation'
          onBack={() => router.back()}
          rightElement={
            <TouchableOpacity
              onPress={handleMenu}
              disabled={!otherUserId}
              accessibilityLabel='Conversation options'
            >
              <Ionicons
                name='ellipsis-horizontal'
                size={24}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          }
        />

        {/* Messages */}
        {isPending ? (
          <ActivityIndicator style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            ref={flatListRef}
            keyboardDismissMode='on-drag'
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) => {
              const isMe = item.sender_id === auth.userId;
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
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            accessibilityLabel='Send message'
            hitSlop={10}
          >
            {sendMessageMutation.isPending ? (
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
