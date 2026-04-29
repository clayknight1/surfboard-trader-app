import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  ActivityIndicator,
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

export default function SellScreen() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();
  const skeletonData = Array.from({ length: 4 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  const { isPending, isError, data } = useQuery({
    queryKey: ['userListings', userId],
    queryFn: () => getListingsByUser(userId!),
    enabled: !!userId,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: listingCount } = useQuery({
    queryKey: ['userListingCount', userId],
    queryFn: () => getUserListingCount(userId!),
    enabled: !!userId,
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

  const atLimit = (listingCount ?? 0) >= tierLimit;

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
        <View style={styles.centered}>
          <Text style={styles.errorText}>Something went wrong</Text>
        </View>
      </Screen>
    );
  }

  const isEmpty = !isPending && (!data || data.length === 0);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Listings</Text>
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
      </View>

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
          data={isPending ? skeletonData : data}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
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
