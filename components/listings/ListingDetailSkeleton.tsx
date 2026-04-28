import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, Spacing } from '../../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = SCREEN_WIDTH * 1.1;

type Props = {
  insets: { top: number; bottom: number };
};

export default function ListingDetailSkeleton({ insets }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity }}>
        {/* Photo */}
        <View style={[styles.photo, { marginTop: insets.top }]} />

        {/* Content */}
        <View style={styles.content}>
          {/* Title + price */}
          <View style={styles.titleRow}>
            <View style={styles.titleLine} />
            <View style={styles.priceLine} />
          </View>

          {/* Location */}
          <View style={styles.locationLine} />

          {/* Specs grid */}
          <View style={styles.specsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.specBlock} />
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Secondary specs */}
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.specRow}>
              <View style={styles.specRowLabel} />
              <View style={styles.specRowValue} />
            </View>
          ))}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Seller */}
          <View style={styles.sellerRow}>
            <View style={styles.avatar} />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerName} />
              <View style={styles.sellerMeta} />
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  photo: {
    width: SCREEN_WIDTH,
    height: PHOTO_HEIGHT,
    backgroundColor: Colors.backgroundSubtle,
  },
  content: {
    padding: Spacing.screenPadding,
    gap: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLine: {
    height: 20,
    width: '55%',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
  },
  priceLine: {
    height: 20,
    width: '25%',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
  },
  locationLine: {
    height: 12,
    width: '35%',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: Spacing.sm,
  },
  specBlock: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  specRowLabel: {
    height: 14,
    width: '30%',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
  },
  specRowValue: {
    height: 14,
    width: '25%',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.backgroundSubtle,
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
  },
  sellerInfo: {
    flex: 1,
    gap: 6,
  },
  sellerName: {
    height: 14,
    width: '40%',
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
  sellerMeta: {
    height: 12,
    width: '55%',
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
});
