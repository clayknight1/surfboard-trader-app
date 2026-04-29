import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { getSavedListings } from '../../lib/services/savedService';
import { Colors, Spacing, Typography } from '../../constants';
import Screen from '../../components/ui/Screen';
import ListingCard from '../../components/listings/ListingCard';
import SignInPrompt from '../../components/ui/SignInPrompt';
import ListingCardSkeleton from '../../components/listings/ListingCardSkeleton';
import { ListingCardData } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();
  const skeletonData = Array.from({ length: 4 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  const { data, isPending } = useQuery({
    queryKey: ['savedListings', userId],
    queryFn: () => getSavedListings(userId!),
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <Screen>
        <SignInPrompt
          icon='heart-outline'
          title='Sign in to view favorites'
          subtitle='Save boards you love and find them later'
        />
      </Screen>
    );
  }

  const isEmpty = !isPending && (!data || data.length === 0);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons
            name='heart-outline'
            size={56}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No saved boards yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart on any listing to save it for later
          </Text>
        </View>
      ) : (
        <FlatList
          data={isPending ? skeletonData : data}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ gap: Spacing.cardGap }}
          contentContainerStyle={styles.list}
          renderItem={({ item }) =>
            isPending ? (
              <ListingCardSkeleton />
            ) : (
              <ListingCard listing={item as ListingCardData} hideDistance />
            )
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: Spacing.screenPadding,
  },
  emptyTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.screenPadding,
    paddingBottom: Spacing.xxl,
    rowGap: Spacing.cardGap,
  },
});
