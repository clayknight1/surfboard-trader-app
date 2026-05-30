import { View, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../constants';
import Screen from './Screen';
import ScreenHeader from './ScreenHeader';

export default function ProfileSkeleton() {
  return (
    <Screen>
      <ScreenHeader title='Profile' />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar skeleton */}
        <View style={styles.identity}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.identityText}>
            <View style={[styles.block, { width: 120, height: 18 }]} />
            <View
              style={[styles.block, { width: 60, height: 14, marginTop: 4 }]}
            />
          </View>
        </View>

        {/* Account section skeleton */}
        <View style={styles.section}>
          <View
            style={[
              styles.block,
              {
                width: 60,
                height: 12,
                marginHorizontal: Spacing.screenPadding,
                marginBottom: Spacing.sm,
              },
            ]}
          />
          <View style={styles.sectionContent}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.row}>
                <View style={[styles.block, { width: 100, height: 16 }]} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.xl,
  },
  identityText: {
    gap: Spacing.xs,
  },
  avatarSkeleton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.backgroundSubtle,
  },
  block: {
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 4,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundSubtle,
  },
});
