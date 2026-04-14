import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { getInbox } from '../../lib/services/messageService';
import { Colors, Spacing, Typography } from '../../constants';
import Screen from '../../components/ui/Screen';
import ThreadRow from '../../components/listings/ThreadRow';
import SignInPrompt from '../../components/ui/SignInPrompt';

export default function MessagesScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();

  const { data, isPending, isError } = useQuery({
    queryKey: ['inbox', userId],
    queryFn: () => getInbox(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: true,
  });

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

  if (isPending) {
    return (
      <Screen>
        <ActivityIndicator style={{ flex: 1 }} />
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
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThreadRow
            thread={item}
            currentUserId={userId!}
            onPress={() => {
              router.push(`/messages/${item.id}?listingId=${item.listing.id}`);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No messages yet.</Text>
            <Text style={styles.emptySubtext}>
              Find a board you like and message the seller.
            </Text>
          </View>
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
  },
  title: {
    ...Typography.displaySmall,
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
