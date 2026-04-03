import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getListing } from '../../lib/services/listingService';
import { Colors, Spacing, Typography } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = SCREEN_WIDTH * 1.1;

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const { isPending, isError, data } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id),
  });

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toLocaleString()}`;
  }

  function formatLength(inches: number): string {
    const feet = Math.floor(inches / 12);
    const remainder = inches % 12;
    const wholeInches = Math.floor(remainder);
    const fraction = remainder - wholeInches;
    const fractions: Record<number, string> = {
      0.125: '⅛',
      0.25: '¼',
      0.375: '⅜',
      0.5: '½',
      0.625: '⅝',
      0.75: '¾',
      0.875: '⅞',
    };
    const nearestSixteenth = Math.round(fraction * 16) / 16;
    const fractionStr = fractions[nearestSixteenth] ?? '';
    return `${feet}'${wholeInches}${fractionStr}"`;
  }

  function getConditionColor(condition: string): string {
    switch (condition) {
      case 'excellent':
        return Colors.conditionExcellent;
      case 'good':
        return Colors.conditionGood;
      case 'fair':
        return Colors.conditionFair;
      case 'poor':
        return Colors.conditionPoor;
      default:
        return Colors.textSecondary;
    }
  }

  function getConditionLabel(condition: string): string {
    return condition.charAt(0).toUpperCase() + condition.slice(1);
  }

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Something went wrong</Text>
      </View>
    );
  }

  const photos = data.listing_photos ?? [];
  const hasPhotos = photos.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={true}
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
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.storage_path }}
                    style={styles.photo}
                    contentFit='contain'
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
            style={[styles.backButton, { top: 12 }]}
            onPress={() => router.back()}
          >
            <Ionicons
              name='chevron-back'
              size={22}
              color={Colors.backgroundCard}
            />
          </TouchableOpacity>

          {/* Floating save button */}
          <TouchableOpacity
            style={[styles.saveButton, { top: 12 }]}
            onPress={() => {}}
          >
            <Ionicons
              name='heart-outline'
              size={22}
              color={Colors.backgroundCard}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title + Price */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{data.title}</Text>
            <Text style={styles.price}>{formatPrice(data.price)}</Text>
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
          <Text style={styles.sectionTitle}>Seller</Text>
          <TouchableOpacity style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>
                {data.user_id.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>View seller profile</Text>
              <Text style={styles.sellerMeta}>Tap to see all listings</Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Bottom padding for sticky button */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky message button */}
      <View
        style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}
      >
        <TouchableOpacity style={styles.messageButton} onPress={() => {}}>
          <Text style={styles.messageButtonText}>Message Seller</Text>
        </TouchableOpacity>
      </View>
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
    left: 46,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    position: 'absolute',
    right: 46,
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
  },
  messageButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
});
