import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getListing,
  markListingAsSold,
} from '../../../lib/services/listingService';
import { Colors, Spacing, Typography } from '../../../constants';
import { useAuth } from '../../../lib/auth';
import Avatar from '../../../components/ui/Avatar';
import SignInModal from '../../../components/ui/SignInModal';
import ListingDetailSkeleton from '../../../components/listings/ListingDetailSkeleton';
import { Animated } from 'react-native';
import { getExistingThread } from '../../../lib/services/messageService';
import { submitReport } from '../../../lib/services/blockService';
import * as Haptics from 'expo-haptics';
import ImageViewing from 'react-native-image-viewing';
import {
  formatLength,
  displayName,
  formatPrice,
  getConditionColor,
  getConditionLabel,
} from '../../../lib/utils';
import * as Sentry from '@sentry/react-native';
import { useSaveListing } from '../../../lib/useSaveListing';
import ErrorState from '../../../components/ui/ErrorState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = SCREEN_WIDTH * 1.1;

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { session } = useAuth();
  const userId = session?.user?.id;
  const scrollY = useRef(new Animated.Value(0)).current;
  const queryClient = useQueryClient();

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, PHOTO_HEIGHT * 0.6],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const { isSaved, toggle } = useSaveListing(id, userId);

  const { isPending, isError, data, refetch } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id),
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5,
  });

  const markAsSoldMutation = useMutation({
    mutationFn: () => markListingAsSold(id),
    onSuccess: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['savedListings'] });
    },
    onError: (err) => {
      Sentry.captureException(err);
      Alert.alert("Couldn't mark as sold", 'Try again in a moment.');
    },
  });

  async function handleMessageSeller(): Promise<void> {
    if (!userId) {
      setSignInModalOpen(true);
      return;
    }
    try {
      const existingThreadId = await getExistingThread(id, userId);
      if (existingThreadId) {
        router.push(`/messages/${existingThreadId}?listingId=${id}`);
      } else {
        router.push({
          pathname: '/messages/new',
          params: { listingId: id, sellerId: data?.user_id },
        });
      }
    } catch (err) {
      Sentry.captureException(err);
      Alert.alert(
        "Couldn't start the conversation",
        'Check your connection and try again.',
      );
    }
  }

  function handleMarkAsSold() {
    Alert.alert(
      'Mark as Sold?',
      'This will remove your listing from search results.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Sold',
          style: 'destructive',
          onPress: () => markAsSoldMutation.mutate(),
        },
      ],
    );
  }

  const reportListingMutation = useMutation({
    mutationFn: (reason: string) =>
      submitReport(userId!, reason, undefined, id),
    onSuccess: () => {
      Alert.alert('Report submitted', 'Thanks — our team will review this.');
    },
    onError: (err) => {
      Sentry.captureException(err);
      Alert.alert("Couldn't submit report", 'Try again in a moment.');
    },
  });

  function handleReportListing() {
    if (!userId) {
      setSignInModalOpen(true);
      return;
    }

    Alert.alert('Report Listing', 'Why are you reporting this listing?', [
      { text: 'Spam', onPress: () => reportListingMutation.mutate('spam') },
      {
        text: 'Misleading',
        onPress: () => reportListingMutation.mutate('misleading'),
      },
      {
        text: 'Inappropriate',
        onPress: () => reportListingMutation.mutate('inappropriate'),
      },
      { text: 'Scam', onPress: () => reportListingMutation.mutate('scam') },
      { text: 'Other', onPress: () => reportListingMutation.mutate('other') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleToggleSave() {
    if (!userId) {
      setSignInModalOpen(true);
      return;
    }
    toggle();
  }

  if (isPending) {
    return <ListingDetailSkeleton insets={insets} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Couldn't load this listing"
        subtitle='Check your connection and try again.'
        retry={() => refetch()}
        onBack={() => router.back()}
      />
    );
  }
  const photos = data.listing_photos ?? [];
  const hasPhotos = photos.length > 0;
  const isBusinessAccount =
    data.public_users?.role === 'shop' || data.public_users?.role === 'shaper';
  const sellerName = isBusinessAccount
    ? (data.public_users?.business_profiles?.business_name ??
      displayName(data.public_users?.full_name))
    : displayName(data.public_users?.full_name);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* Photo carousel */}
        <View
          style={[
            styles.photoContainer,
            { marginTop: insets.top, backgroundColor: Colors.background },
          ]}
        >
          {hasPhotos ? (
            <>
              <FlatList
                data={photos}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                  );
                  setActivePhotoIndex(index);
                }}
                renderItem={({ item, index }) => (
                  <Image
                    source={{ uri: item.storage_path }}
                    style={styles.photo}
                    contentFit='contain'
                    transition={200}
                    priority={index === 0 ? 'high' : 'low'}
                  />
                )}
              />
              {/* Dot indicators */}
              {photos.length > 1 && (
                <View style={styles.dots}>
                  {photos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === activePhotoIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons
                name='image-outline'
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.photoPlaceholderText}>No photos</Text>
            </View>
          )}

          {/* Floating back button */}
          <TouchableOpacity
            style={[
              styles.backButton,
              { top: Platform.OS === 'android' ? insets.top : 12 },
            ]}
            onPress={() => router.back()}
            accessibilityLabel='Go back'
            hitSlop={10}
          >
            <Ionicons
              name='chevron-back'
              size={22}
              color={Colors.backgroundCard}
            />
          </TouchableOpacity>

          {/* Floating save button */}
          {data.user_id !== userId && (
            <TouchableOpacity
              style={[
                styles.saveButton,
                { top: Platform.OS === 'android' ? insets.top : 12 },
              ]}
              onPress={handleToggleSave}
              accessibilityLabel={isSaved ? 'Unsave listing' : 'Save listing'}
              hitSlop={10}
            >
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={22}
                color={isSaved ? Colors.accent : Colors.backgroundCard}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.expandButton]}
            accessibilityLabel='View photo full screen'
            onPress={() => {
              setLightboxIndex(activePhotoIndex);
              setLightboxOpen(true);
            }}
          >
            <Ionicons
              name='expand-outline'
              size={18}
              color={Colors.backgroundCard}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title + Price */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{data.title}</Text>
            <Text style={styles.price}>
              {formatPrice(data.price, data.currency ?? 'USD')}
            </Text>
          </View>

          {/* Location + distance */}
          <View style={styles.locationRow}>
            <Ionicons
              name='location-outline'
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.location}>{data.location_label}</Text>
          </View>

          {/* Key specs */}
          <View style={styles.specsGrid}>
            {data.volume && (
              <View style={styles.specBlock}>
                <Text style={styles.specLabel}>volume</Text>
                <Text style={styles.specValue}>{data.volume}L</Text>
              </View>
            )}
            {data.length_inches && (
              <View style={styles.specBlock}>
                <Text style={styles.specLabel}>length</Text>
                <Text style={styles.specValue}>
                  {formatLength(Number(data.length_inches))}
                </Text>
              </View>
            )}
            {data.width_inches && (
              <View style={styles.specBlock}>
                <Text style={styles.specLabel}>width</Text>
                <Text style={styles.specValue}>{data.width_inches}"</Text>
              </View>
            )}
            {data.thickness_inches && (
              <View style={styles.specBlock}>
                <Text style={styles.specLabel}>thickness</Text>
                <Text style={styles.specValue}>{data.thickness_inches}"</Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Secondary specs */}
          <View style={styles.secondarySpecs}>
            {data.board_type && (
              <View style={styles.specRow}>
                <Text style={styles.specRowLabel}>Board type</Text>
                <Text style={styles.specRowValue}>
                  {data.board_type.charAt(0).toUpperCase() +
                    data.board_type.slice(1)}
                </Text>
              </View>
            )}
            {data.fin_system && (
              <View style={styles.specRow}>
                <Text style={styles.specRowLabel}>Fin system</Text>
                <Text style={styles.specRowValue}>
                  {data.fin_system.toUpperCase()}
                </Text>
              </View>
            )}
            {data.fin_setup && (
              <View style={styles.specRow}>
                <Text style={styles.specRowLabel}>Fin setup</Text>
                <Text style={styles.specRowValue}>
                  {data.fin_setup.charAt(0).toUpperCase() +
                    data.fin_setup.slice(1).replace('_', '+')}
                </Text>
              </View>
            )}
            {data.condition && (
              <View style={styles.specRow}>
                <Text style={styles.specRowLabel}>Condition</Text>
                <View style={styles.conditionRow}>
                  <View
                    style={[
                      styles.conditionDot,
                      { backgroundColor: getConditionColor(data.condition) },
                    ]}
                  />
                  <Text style={styles.specRowValue}>
                    {getConditionLabel(data.condition)}
                  </Text>
                </View>
              </View>
            )}
            {data.shaper_brand && (
              <View style={styles.specRow}>
                <Text style={styles.specRowLabel}>Shaper / Brand</Text>
                <Text style={styles.specRowValue}>{data.shaper_brand}</Text>
              </View>
            )}
            {data.ships_domestically && (
              <View style={styles.specRow}>
                <Text style={styles.specRowLabel}>Ships domestically</Text>
                <Text style={styles.specRowValue}>Yes</Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          {data.description && (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{data.description}</Text>
              <View style={styles.divider} />
            </>
          )}

          {/* Seller */}
          {data.user_id !== userId && (
            <>
              <Text style={styles.sectionTitle}>Seller</Text>
              <TouchableOpacity
                style={styles.sellerRow}
                onPress={() => router.push(`/users/${data.user_id}`)}
              >
                <Avatar
                  avatarUrl={
                    isBusinessAccount
                      ? (data.public_users?.business_profiles?.logo_url ??
                        data.public_users?.avatar_url ??
                        null)
                      : (data.public_users?.avatar_url ?? null)
                  }
                  fullName={data.public_users?.full_name ?? null}
                  size={40}
                  shape={isBusinessAccount ? 'rounded' : 'circle'}
                />
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>
                    {sellerName ?? 'Unknown'}
                  </Text>
                  <Text style={styles.sellerMeta}>Tap to see all listings</Text>
                </View>
                <Ionicons
                  name='chevron-forward'
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </>
          )}

          {/* Bottom padding for sticky button */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Sticky header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            opacity: headerOpacity,
            paddingTop: insets.top,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.stickyTitle} numberOfLines={1}>
          {data?.title ?? ''}
        </Text>
        <View style={{ width: 24 }} />
      </Animated.View>

      {/* Sticky footer */}
      {data.user_id === userId ? (
        <View
          style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}
        >
          {data.status === 'sold' ? (
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={[styles.messageButton, styles.secondaryButton]}
                onPress={() => router.push(`/listings/${id}/edit`)}
              >
                <Text style={styles.secondaryButtonText}>Edit</Text>
              </TouchableOpacity>
              <View style={styles.soldBanner}>
                <Text style={styles.soldBannerText}>Sold</Text>
              </View>
            </View>
          ) : (
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={[styles.messageButton, styles.secondaryButton]}
                onPress={() => router.push(`/listings/${id}/edit`)}
              >
                <Text style={styles.secondaryButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMarkAsSold}
              >
                <Text style={styles.messageButtonText}>Mark as Sold</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : data.status === 'sold' ? (
        <View
          style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}
        >
          <View style={styles.soldBanner}>
            <Text style={styles.soldBannerText}>This listing is sold</Text>
          </View>
        </View>
      ) : data.status === 'deleted' ? (
        <View
          style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}
        >
          <View style={styles.soldBanner}>
            <Text style={styles.soldBannerText}>
              This listing has been removed
            </Text>
          </View>
        </View>
      ) : (
        // existing "Message Seller" button
        <View
          style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}
        >
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessageSeller}
          >
            <Text style={styles.messageButtonText}>Message Seller</Text>
          </TouchableOpacity>
        </View>
      )}
      {data.user_id !== userId && data.status !== 'deleted' && (
        <TouchableOpacity
          style={styles.reportLink}
          onPress={handleReportListing}
        >
          <Text style={styles.reportLinkText}>Report listing</Text>
        </TouchableOpacity>
      )}

      <SignInModal
        isOpen={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
        title='Sign in to message sellers'
        subtitle='Create a free account to contact sellers and buy boards'
      />

      <ImageViewing
        images={photos.map((p) => ({ uri: p.storage_path }))}
        imageIndex={lightboxIndex}
        visible={lightboxOpen}
        onRequestClose={() => setLightboxOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  photoContainer: {
    width: SCREEN_WIDTH,
    height: PHOTO_HEIGHT,
    position: 'relative',
  },
  photo: {
    width: SCREEN_WIDTH,
    height: PHOTO_HEIGHT,
  },
  photoPlaceholder: {
    width: SCREEN_WIDTH,
    height: PHOTO_HEIGHT,
    backgroundColor: Colors.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  photoPlaceholderText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: Colors.backgroundCard,
    width: 18,
  },
  backButton: {
    position: 'absolute',
    left: 36,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    position: 'absolute',
    right: 36,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButton: {
    position: 'absolute',
    left: 36,
    bottom: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.screenPadding,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 6,
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
    flex: 1,
  },
  price: {
    ...Typography.heading,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.lg,
  },
  location: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  specBlock: {
    flex: 1,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  specLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  specValue: {
    ...Typography.spec,
    color: Colors.textPrimary,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  secondarySpecs: {
    gap: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specRowLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  specRowValue: {
    ...Typography.body,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.backgroundSubtle,
    padding: Spacing.md,
    borderRadius: 12,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    ...Typography.label,
    color: Colors.backgroundCard,
    fontFamily: Typography.fontBold,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    ...Typography.body,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  sellerMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 12,
  },
  messageButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
  },
  messageButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  stickyTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },

  footerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundSubtle,
  },
  secondaryButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  soldBanner: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
  },
  soldBannerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  soldBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.backgroundSubtle,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: Spacing.sm,
  },
  soldBadgeText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  reportLink: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  reportLinkText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
