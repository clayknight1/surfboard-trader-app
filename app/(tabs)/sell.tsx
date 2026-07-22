import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import {
  getListingsByUser,
  getUserListingCount,
} from '../../lib/services/listingService';
import { useRouter } from 'expo-router';
import Screen from '../../components/ui/Screen';
import SellerListingCard from '../../components/listings/SellerListingCard';
import { Colors, Spacing, Typography } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import SignInPrompt from '../../components/ui/SignInPrompt';
import { ListingWithPhotos } from '../../lib/types';
import SellerListingCardSkeleton from '../../components/listings/SellerListingCardSkeleton';
import { useState } from 'react';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ErrorState from '../../components/ui/ErrorState';

export default function SellScreen() {
  const { session, profile, loading } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();
  const skeletonData = Array.from({ length: 4 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  const { isPending, isError, data, refetch } = useQuery({
    queryKey: ['userListings', userId],
    queryFn: () => getListingsByUser(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const sortedData = [...(data ?? [])].sort((a, b) => {
    if (a.status === 'sold' && b.status !== 'sold') return 1;
    if (a.status !== 'sold' && b.status === 'sold') return -1;
    return 0;
  });

  async function handleRefresh() {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['userListings'] });
    setIsRefreshing(false);
  }

  const tierLimit =
    profile?.tier === 'starter'
      ? 25
      : profile?.tier === 'pro'
        ? Infinity
        : profile?.tier === 'business'
          ? Infinity
          : 5; // free

  const atLimit =
    (data?.filter((l) => l.status === 'active').length ?? 0) >= tierLimit;

  if (loading) {
    return null;
  }

  if (!userId) {
    return (
      <Screen>
        <SignInPrompt
          icon='chatbubble-outline'
          title='Sign in to sell your board'
          subtitle='List your board and connect with buyers near you'
        />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <ScreenHeader title='Sell' />
        <ErrorState
          title="Couldn't load your listings"
          subtitle='Check your connection and try again.'
          retry={() => refetch()}
        />
      </Screen>
    );
  }

  const isEmpty = !isPending && (!sortedData || sortedData.length === 0);

  return (
    <Screen>
      <ScreenHeader
        title='My Listings'
        rightElement={
          <TouchableOpacity
            style={[styles.addButton, atLimit && styles.addButtonDisabled]}
            onPress={() =>
              atLimit
                ? Alert.alert(
                    'Listing limit reached',
                    'Upgrade your plan to list more boards.',
                  )
                : router.push('/listings/create')
            }
          >
            <Ionicons name='add' size={22} color={Colors.backgroundCard} />
          </TouchableOpacity>
        }
      />

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons
            name='storefront-outline'
            size={56}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to list your first board
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/listings/create')}
          >
            <Text style={styles.createButtonText}>Create listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={isPending ? skeletonData : sortedData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) =>
            isPending ? (
              <SellerListingCardSkeleton />
            ) : (
              <SellerListingCard
                item={item as ListingWithPhotos}
                onPress={() => router.push(`/listings/${item.id}`)}
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
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
  createButton: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  createButtonText: {
    ...Typography.body,
    fontFamily: Typography.fontSemibold,
    color: Colors.backgroundCard,
  },
  list: {
    padding: Spacing.screenPadding,
    gap: Spacing.sm,
  },
  addButtonDisabled: {
    backgroundColor: Colors.backgroundSubtle,
  },
  createButtonDisabled: {
    backgroundColor: Colors.backgroundSubtle,
  },
});
