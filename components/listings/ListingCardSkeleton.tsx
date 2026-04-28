import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, Spacing } from '../../constants';
import { Dimensions } from 'react-native';

const CARD_WIDTH =
  (Dimensions.get('window').width -
    Spacing.screenPadding * 2 -
    Spacing.cardGap) /
  2;
const PHOTO_HEIGHT = CARD_WIDTH * 1.3;

export default function ListingCardSkeleton() {
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
    <Animated.View style={[styles.container, { opacity }]}>
      {/* Photo placeholder */}
      <View style={styles.photo} />

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.titleLine} />
        <View style={styles.titleLineShort} />
        <View style={styles.priceLine} />
        <View style={styles.specsRow}>
          <View style={styles.specChip} />
          <View style={styles.specChip} />
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.bottomChip} />
          <View style={styles.bottomChip} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: Colors.backgroundSkeleton,
    borderRadius: Spacing.cardRadius,
    overflow: 'hidden',
    marginBottom: Spacing.cardGap,
  },
  photo: {
    width: '100%',
    height: PHOTO_HEIGHT,
    backgroundColor: Colors.backgroundSubtle,
  },
  info: {
    padding: Spacing.cardPadding,
    gap: 8,
  },
  titleLine: {
    height: 14,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
    width: '90%',
  },
  titleLineShort: {
    height: 14,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
    width: '60%',
  },
  priceLine: {
    height: 16,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
    width: '40%',
  },
  specsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  specChip: {
    height: 20,
    width: 40,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  bottomChip: {
    height: 12,
    width: 30,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
  },
});
