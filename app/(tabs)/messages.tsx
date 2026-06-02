import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { getInbox } from '../../lib/services/messageService';
import { Colors, Spacing, Typography } from '../../constants';
import Screen from '../../components/ui/Screen';
import ThreadRow from '../../components/listings/ThreadRow';
import SignInPrompt from '../../components/ui/SignInPrompt';
import ThreadRowSkeleton from '../../components/listings/ThreadRowSkeleton';
import { ThreadPreview } from '../../lib/types';
import { useState } from 'react';
import ScreenHeader from '../../components/ui/ScreenHeader';
import EmptyState from '../../components/ui/EmptyState';

export default function MessagesScreen() {
  const { session, loading } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  const { data, isPending, isError } = useQuery({
    queryKey: ['inbox', userId],
    queryFn: () => getInbox(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: true,
  });

  async function handleRefresh() {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['inbox'] });
    setIsRefreshing(false);
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
        <View style={styles.centered}>
          <Text style={styles.errorText}>Something went wrong.</Text>
        </View>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
