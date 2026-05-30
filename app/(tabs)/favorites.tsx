import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { useState } from 'react';
import ScreenHeader from '../../components/ui/ScreenHeader';

export default function FavoritesScreen() {
  const { session, loading } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const skeletonData = Array.from({ length: 4 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  const { data, isPending, isError } = useQuery({
    queryKey: ['savedListings', userId],
    queryFn: () => getSavedListings(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
  if (loading) {
    return null;
  }

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

  async function handleRefresh() {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['savedListings'] });
    setIsRefreshing(false);
  }

  const isEmpty = !isPending && !isError && (!data || data.length === 0);

  return (
    <Screen>
      <ScreenHeader title='Favorites' />

      <FlatList
        data={isPending ? skeletonData : data}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: Spacing.cardGap }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isError ? (
            <View
              style={{
                height: Dimensions.get('window').height * 0.6,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: Spacing.screenPadding,
              }}
            >
              <Text
                style={{
                  ...Typography.body,
                  color: Colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                Something went wrong. Pull down to try again.
              </Text>
            </View>
          ) : isEmpty ? (
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
          ) : null
        }
        renderItem={({ item }) =>
          isPending ? (
            <ListingCardSkeleton />
          ) : (
            <ListingCard listing={item as ListingCardData} hideDistance />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
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
