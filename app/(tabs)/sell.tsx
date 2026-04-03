import { useQuery } from '@tanstack/react-query';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { getListingsByUser } from '../../lib/services/listingService';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import Screen from '../../components/ui/Screen';
import SellerListingCard from '../../components/listings/SellerListingCard';
import { Colors, Spacing, Typography } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function SellScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();

  useEffect(() => {
    if (!session) router.replace('/auth/login');
  }, [session]);

  const { isPending, isError, data } = useQuery({
    queryKey: ['userListings', userId],
    queryFn: () => getListingsByUser(userId!),
    enabled: !!userId,
  });

  if (!session) return null;

  if (isPending) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.accent} />
        </View>
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

  const isEmpty = !data || data.length === 0;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/listings/create')}
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
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SellerListingCard
              item={item}
              onPress={() => router.push(`/listings/${item.id}`)}
            />
          )}
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
});
