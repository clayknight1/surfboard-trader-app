import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
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
    staleTime: 1000 * 30,
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
        <View style={styles.centered}>
          <Text style={styles.errorText}>Something went wrong.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
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
        ListEmptyComponent={
          !isPending ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No messages yet.</Text>
              <Text style={styles.emptySubtext}>
                Find a board you like and message the seller.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    height: 56,
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
