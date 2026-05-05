import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getPublicProfile,
  getPublicListings,
} from '../../lib/services/userService';
import { Colors, Spacing, Typography } from '../../constants';
import Avatar from '../../components/ui/Avatar';
import ListingCard from '../../components/listings/ListingCard';
import { ListingCardData } from '../../lib/types';
import { getSavedListingIds } from '../../lib/services/savedService';
import { useAuth } from '../../lib/auth';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { session } = useAuth();
  const currentUserId = session?.user?.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: profile, isPending: profilePending } = useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => getPublicProfile(userId),
    enabled: !!userId,
  });

  const { data: listings, isPending: listingsPending } = useQuery({
    queryKey: ['publicListings', userId],
    queryFn: () => getPublicListings(userId),
    enabled: !!userId,
  });

  const { data: savedIds } = useQuery({
    queryKey: ['savedIds', userId],
    queryFn: () => getSavedListingIds(currentUserId!),
    enabled: !!userId,
  });

  const isPending = profilePending || listingsPending;
  const isShopOrShaper = profile?.role === 'shop' || profile?.role === 'shaper';
  const businessProfile = profile?.business_profiles;

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      {/* Back button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 12 }]}
        onPress={() => router.back()}
        hitSlop={10}
      >
        <Ionicons name='chevron-back' size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      <FlatList
        data={listings}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: Spacing.cardGap }}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Business logo or avatar */}

            {isShopOrShaper && businessProfile?.logo_url ? (
              <Image
                source={{ uri: businessProfile.logo_url }}
                style={styles.logoImage}
                contentFit='contain'
              />
            ) : (
              <Avatar
                avatarUrl={profile?.avatar_url ?? null}
                fullName={profile?.full_name ?? null}
                size={72}
              />
            )}

            {/* Name */}
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {isShopOrShaper
                  ? (businessProfile?.business_name ?? profile?.full_name)
                  : (profile?.full_name ?? 'Unknown')}
              </Text>
              {isShopOrShaper && (
                <Ionicons
                  name='checkmark-circle'
                  size={18}
                  color={Colors.accent}
                />
              )}
            </View>

            {/* Role badge */}
            {isShopOrShaper && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {profile?.role === 'shop' ? 'Shop' : 'Shaper'}
                </Text>
              </View>
            )}

            {/* Bio */}
            {businessProfile?.bio && (
              <Text style={styles.bio}>{businessProfile.bio}</Text>
            )}

            {/* Location */}
            {businessProfile?.location_label && (
              <View style={styles.locationRow}>
                <Ionicons
                  name='location-outline'
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.location}>
                  {businessProfile.location_label}
                </Text>
              </View>
            )}

            {/* Social links */}
            <View style={styles.socialRow}>
              {businessProfile?.website && (
                <TouchableOpacity
                  style={styles.socialChip}
                  onPress={() => Linking.openURL(businessProfile.website!)}
                >
                  <Ionicons
                    name='globe-outline'
                    size={14}
                    color={Colors.accent}
                  />
                  <Text style={styles.socialText}>Website</Text>
                </TouchableOpacity>
              )}
              {businessProfile?.instagram_handle && (
                <TouchableOpacity
                  style={styles.socialChip}
                  onPress={() =>
                    Linking.openURL(
                      `https://instagram.com/${businessProfile.instagram_handle}`,
                    )
                  }
                >
                  <Ionicons
                    name='logo-instagram'
                    size={14}
                    color={Colors.accent}
                  />
                  <Text style={styles.socialText}>
                    @{businessProfile.instagram_handle}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Listings header */}
            <Text style={styles.listingsLabel}>
              {listings?.length ?? 0} listings
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard
            listing={item as ListingCardData}
            hideDistance
            userId={currentUserId}
            savedIds={savedIds ?? []}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active listings</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.screenPadding,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xxxl,
    rowGap: Spacing.cardGap,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  logoImage: {
    width: '70%',
    aspectRatio: 3,
    resizeMode: 'contain',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  name: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  roleBadge: {
    backgroundColor: Colors.backgroundSubtle,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  roleBadgeText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  bio: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  socialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundSubtle,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  socialText: {
    ...Typography.caption,
    color: Colors.accent,
  },
  listingsLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
