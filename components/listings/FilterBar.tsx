import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';
import { FilterState } from '../../lib/types';

export type FilterKey =
  | 'volume'
  | 'length'
  | 'boardType'
  | 'finSystem'
  | 'radius';

type FilterChip = {
  key: FilterKey;
  label: string;
  isActive: (filters: FilterState) => boolean;
};

const CHIPS: FilterChip[] = [
  {
    key: 'volume',
    label: 'Volume',
    isActive: (f) => f.volumeMin !== null || f.volumeMax !== null,
  },
  {
    key: 'length',
    label: 'Length',
    isActive: (f) => f.lengthMin !== null || f.lengthMax !== null,
  },
  {
    key: 'boardType',
    label: 'Board Type',
    isActive: (f) => f.boardType !== null,
  },
  {
    key: 'finSystem',
    label: 'Fin System',
    isActive: (f) => f.finSystem !== null,
  },
  { key: 'radius', label: 'Distance', isActive: (f) => f.radiusMiles !== 25 },
];

type FilterBarProps = {
  filters: FilterState;
  openFilter: FilterKey | null;
  onFilterPress: (key: FilterKey) => void;
};

export default function FilterBar({
  filters,
  openFilter,
  onFilterPress,
}: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container]}
    >
      {CHIPS.map((chip) => {
        const isActive = chip.isActive(filters);
        const isOpen = openFilter === chip.key;

        return (
          <TouchableOpacity
            key={chip.key}
            style={[
              styles.chip,
              isActive && styles.chipActive,
              isOpen && styles.chipOpen,
            ]}
            onPress={() => onFilterPress(chip.key)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
            </Text>
            {isActive && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
    // paddingBottom: Spacing.lg,
  },
  chip: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    borderColor: Colors.accent,
  },
  chipOpen: {
    borderColor: Colors.accent,
    backgroundColor: Colors.backgroundSubtle,
  },
  chipText: {
    ...Typography.body,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  chipTextActive: {
    color: Colors.accent,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
});
