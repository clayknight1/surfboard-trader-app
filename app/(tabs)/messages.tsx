import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { getInbox } from '../../lib/services/messageService';
import { Colors } from '../../constants';
import Screen from '../../components/ui/Screen';
import ThreadRow from '../../components/listings/ThreadRow';
import SignInPrompt from '../../components/ui/SignInPrompt';
import ThreadRowSkeleton from '../../components/listings/ThreadRowSkeleton';
import { ThreadPreview } from '../../lib/types';
import { useEffect, useRef, useState } from 'react';
import ScreenHeader from '../../components/ui/ScreenHeader';
import EmptyState from '../../components/ui/EmptyState';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ui/ErrorState';
import { usePushPrompt } from '../../lib/usePushPrompt';
import PushPrePrompt from '../../components/push/PushPrePrompt';

export default function MessagesScreen() {
  const { session, loading } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const shownThisSessionRef = useRef(false);
  const {
    permission,
    canPromptNow,
    requestAndRegister,
    markDismissed,
    openSettings,
  } = usePushPrompt();
  const queryClient = useQueryClient();
  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['inbox', userId],
    queryFn: () => getInbox(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`inbox:${userId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['inbox'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  useEffect(() => {
    if (!userId) return;
    if (canPromptNow && !shownThisSessionRef.current) {
      shownThisSessionRef.current = true;
      setShowPushModal(true);
    }
  }, [userId, canPromptNow]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['inbox'] });
    setIsRefreshing(false);
  }

  async function handlePushEnable() {
    setShowPushModal(false);
    if (permission === 'denied') {
      await openSettings();
    } else {
      const status = await requestAndRegister();
      if (status !== 'granted') {
        await markDismissed();
      }
    }
  }

  async function handlePushDismiss() {
    setShowPushModal(false);
    await markDismissed();
  }

  if (loading) {
    return null;
  }

  if (!userId) {
    return (
      <Screen>
        <SignInPrompt
          icon='chatbubble-outline'
          title='Sign in to view messages'
          subtitle='Connect with buyers and sellers in your area'
        />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <ScreenHeader title='Messages' />
        <ErrorState
          title="Couldn't load messages"
          subtitle='Check your connection and try again.'
          retry={() => refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title='Messages' />
      {!isPending && data?.length === 0 ? (
        <EmptyState
          icon='chatbubble-outline'
          title='No messages yet'
          subtitle='Find a board you like and message the seller.'
        />
      ) : (
        <FlatList
          data={isPending ? skeletonData : data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            isPending ? (
              <ThreadRowSkeleton />
            ) : (
              <ThreadRow
                thread={item as ThreadPreview}
                currentUserId={userId!}
                onPress={() => {
                  router.push(
                    `/messages/${item.id}?listingId=${(item as ThreadPreview).listing?.id}`,
                  );
                }}
              />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.accent}
            />
          }
        />
      )}

      <PushPrePrompt
        visible={showPushModal}
        permission={permission}
        onEnable={handlePushEnable}
        onDismiss={handlePushDismiss}
        message='Get a push when someone messages you about a board.'
      />
    </Screen>
  );
}
