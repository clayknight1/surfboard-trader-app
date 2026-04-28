import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, Spacing } from '../../constants';

export default function SellerListingCardSkeleton() {
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
    <Animated.View style={[styles.card, { opacity }]}>
      {/* Photo */}
      <View style={styles.photo} />

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.titleLine} />
        <View style={styles.titleLineShort} />
        <View style={styles.priceLine} />
        <View style={styles.metaRow}>
          <View style={styles.dot} />
          <View style={styles.metaChip} />
          <View style={styles.metaChip} />
        </View>
      </View>
    </Animated.View>
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
  photo: {
    width: 80,
    height: 80,
    backgroundColor: Colors.border,
  },
  info: {
    flex: 1,
    gap: 6,
    paddingVertical: Spacing.md,
  },
  titleLine: {
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 4,
    width: '80%',
  },
  titleLineShort: {
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 4,
    width: '50%',
  },
  priceLine: {
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 4,
    width: '30%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  metaChip: {
    height: 12,
    width: 35,
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
});
