import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ListingWithPhotos } from '../../lib/types';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants';
import { formatPrice } from '../../lib/utils';

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return Colors.conditionExcellent;
    case 'sold':
      return Colors.textSecondary;
    case 'hidden':
      return Colors.conditionFair;
    default:
      return Colors.textSecondary;
  }
}

export default function SellerListingCard({
  item,
  onPress,
}: {
  item: ListingWithPhotos;
  onPress: () => void;
}) {
  const primaryPhoto =
    item.listing_photos?.find((p) => p.is_primary) ?? item.listing_photos?.[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Photo */}
      <View style={styles.cardPhoto}>
        {primaryPhoto ? (
          <Image
            source={{ uri: primaryPhoto.storage_path }}
            style={styles.photo}
            contentFit='cover'
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons
              name='image-outline'
              size={24}
              color={Colors.textSecondary}
            />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.cardMeta}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
          {item.volume && <Text style={styles.cardSpec}>{item.volume}L</Text>}
        </View>
      </View>

      <Ionicons name='chevron-forward' size={16} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
    overflow: 'hidden',
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  cardPhoto: {
    width: 80,
    height: 80,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
    paddingVertical: Spacing.md,
  },
  cardTitle: {
    ...Typography.body,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  cardPrice: {
    ...Typography.body,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  cardSpec: {
    ...Typography.caption,
    fontFamily: Typography.fontMono,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});
