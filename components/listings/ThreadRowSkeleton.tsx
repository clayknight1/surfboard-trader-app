import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, Spacing } from '../../constants';

export default function ThreadRowSkeleton() {
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
    <Animated.View style={[styles.row, { opacity }]}>
      {/* Avatar */}
      <View style={styles.avatar} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameLine} />
          <View style={styles.timeLine} />
        </View>
        <View style={styles.listingLine} />
        <View style={styles.previewLine} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameLine: {
    height: 14,
    width: '40%',
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
  timeLine: {
    height: 12,
    width: '15%',
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
  listingLine: {
    height: 12,
    width: '60%',
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
  previewLine: {
    height: 12,
    width: '80%',
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
});
