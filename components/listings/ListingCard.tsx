import { useRouter } from 'expo-router';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { ListingCardData } from '../../lib/types';
import { Colors, Typography, Spacing } from '../../constants';

type ListingCardProps = {
  listing: ListingCardData;
  hideDistance?: boolean;
};

const CARD_WIDTH =
  (Dimensions.get('window').width -
    Spacing.screenPadding * 2 -
    Spacing.cardGap) /
  2;
const PHOTO_HEIGHT = CARD_WIDTH * 1.3;

export default function ListingCard({
  listing,
  hideDistance = false,
}: ListingCardProps) {
  const router = useRouter();

  function onSelect(): void {
    router.push(`/listings/${listing.id}`);
  }

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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelect}
      activeOpacity={0.92}
    >
      {/* Photo */}
      <View style={styles.photoContainer}>
        {listing.primary_photo ? (
          <Image
            source={{ uri: listing.primary_photo }}
            style={styles.photo}
            contentFit='cover'
            transition={400}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>No Photo</Text>
          </View>
        )}

        {/* Sponsored badge */}
        {listing.is_sponsored && (
          <View style={styles.sponsoredBadge}>
            <Text style={styles.sponsoredText}>Featured</Text>
          </View>
        )}

        {/* Listing type badge for non-used */}
        {listing.listing_type !== 'for_sale' && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {listing.listing_type === 'vintage' ? 'Vintage' : 'New'}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>

        {/* Price */}
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>

        {/* Key specs row */}
        <View style={styles.specsRow}>
          {listing.volume && (
            <View style={styles.specChip}>
              <Text style={styles.specValue}>{listing.volume}L</Text>
            </View>
          )}
          {listing.length_inches && (
            <View style={styles.specChip}>
              <Text style={styles.specValue}>
                {formatLength(Number(listing.length_inches))}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom row — fin system + condition + distance */}
        <View style={styles.bottomRow}>
          {listing.fin_system && (
            <Text style={styles.finSystem}>
              {listing.fin_system.toUpperCase()}
            </Text>
          )}
          {listing.condition && (
            <View
              style={[
                styles.conditionDot,
                { backgroundColor: getConditionColor(listing.condition) },
              ]}
            />
          )}
          {!hideDistance && (
            <Text style={styles.distance}>
              {listing.distance_miles.toFixed(1)}mi
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Spacing.cardRadius,
    overflow: 'hidden',
    marginBottom: Spacing.cardGap,
  },
  photoContainer: {
    width: '100%',
    height: PHOTO_HEIGHT,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.sponsored,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sponsoredText: {
    ...Typography.label,
    color: Colors.textInverse,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeText: {
    ...Typography.label,
    color: Colors.backgroundCard,
  },
  info: {
    padding: Spacing.cardPadding,
    gap: 6,
  },
  title: {
    ...Typography.body,
    fontFamily: Typography.fontMedium,
    color: Colors.textOnCard,
  },
  price: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.textOnCard,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  specChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  specValue: {
    ...Typography.spec,
    color: Colors.textPrimary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  finSystem: {
    ...Typography.label,
    color: Colors.textOnCardMuted,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  distance: {
    ...Typography.caption,
    color: Colors.textOnCardMuted,
    marginLeft: 'auto',
  },
});
