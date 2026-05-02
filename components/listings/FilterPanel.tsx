import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BOARD_TYPE_OPTIONS,
  Colors,
  FIN_SYSTEM_OPTIONS,
  Spacing,
  Typography,
} from '../../constants';
import { FilterState } from '../../lib/types';
import { FilterKey } from './FilterBar';
import CheckList from '../ui/CheckList';
import RangeSlider from '../ui/RangeSlider';
import { Slider } from '@miblanchard/react-native-slider';

type FilterPanelProps = {
  openFilter: FilterKey | null;
  filters: FilterState;
  style?: object;
  onClose: () => void;
  onReset: (key: FilterKey) => void;
  onFilterChange: (updates: Partial<FilterState>) => void;
};

const FILTER_LABELS: Record<FilterKey, string> = {
  volume: 'Volume',
  length: 'Length',
  boardType: 'Board Type',
  finSystem: 'Fin System',
  radius: 'Distance',
};

export default function FilterPanel({
  openFilter,
  filters,
  onClose,
  onReset,
  onFilterChange,
  style,
}: FilterPanelProps) {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [volumeRange, setVolumeRange] = useState<[number, number]>([
    filters.volumeMin ?? 0,
    filters.volumeMax ?? 80,
  ]);
  const [lengthRange, setLengthRange] = useState<[number, number]>([
    filters.lengthMin ?? 48,
    filters.lengthMax ?? 120,
  ]);
  const [radiusValue, setRadiusValue] = useState<number>(filters.radiusMiles);

  useEffect(() => {
    if (openFilter !== null) {
      setActiveFilter(openFilter);
      Animated.spring(animatedHeight, {
        toValue: contentHeight,
        useNativeDriver: false,
        bounciness: 0,
        speed: 20,
      }).start();
    } else {
      Animated.spring(animatedHeight, {
        toValue: 0,
        useNativeDriver: false,
        bounciness: 0,
        speed: 20,
      }).start(() => setActiveFilter(null));
    }
  }, [openFilter, contentHeight]);

  useEffect(() => {
    if (filters.volumeMin === null && filters.volumeMax === null) {
      setVolumeRange([0, 80]);
    }
  }, [filters.volumeMin, filters.volumeMax]);

  useEffect(() => {
    if (filters.lengthMin === null && filters.lengthMax === null) {
      setLengthRange([48, 120]);
    }
  }, [filters.lengthMin, filters.lengthMax]);

  useEffect(() => {
    if (filters.radiusMiles === 25) {
      setRadiusValue(25);
    }
  }, [filters.radiusMiles]);

  function formatLength(inches: number): string {
    const feet = Math.floor(inches / 12);
    const remainder = Math.round(inches % 12);
    return `${feet}'${remainder}"`;
  }

  return (
    <Animated.View style={[styles.wrapper, { height: animatedHeight }, style]}>
      <View
        style={styles.content}
        onLayout={(e) => {
          setContentHeight(e.nativeEvent.layout.height);
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {activeFilter ? FILTER_LABELS[activeFilter] : ''}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => openFilter && onReset(openFilter)}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name='close' size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.panelContent}>
          {activeFilter === 'boardType' && (
            <CheckList
              options={BOARD_TYPE_OPTIONS}
              value={filters.boardType}
              onSelect={(value) => onFilterChange({ boardType: value })}
            />
          )}
          {activeFilter === 'finSystem' && (
            <CheckList
              options={FIN_SYSTEM_OPTIONS}
              value={filters.finSystem}
              onSelect={(value) => onFilterChange({ finSystem: value })}
            />
          )}
          {activeFilter === 'volume' && (
            <RangeSlider
              min={0}
              max={80}
              step={0.5}
              unit='L'
              low={volumeRange[0]}
              high={volumeRange[1]}
              onChange={(low, high) => {
                setVolumeRange([low, high]);
                onFilterChange({ volumeMin: low, volumeMax: high });
              }}
            />
          )}
          {activeFilter === 'length' && (
            <RangeSlider
              min={48}
              max={120}
              step={1}
              low={lengthRange[0]}
              high={lengthRange[1]}
              onChange={(low, high) => {
                setLengthRange([low, high]);
                onFilterChange({ lengthMin: low, lengthMax: high });
              }}
              formatLabel={formatLength}
            />
          )}
          {activeFilter === 'radius' && (
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderValue}>{radiusValue} mi</Text>
              </View>
              <Slider
                value={radiusValue}
                minimumValue={10}
                maximumValue={200}
                step={5}
                onValueChange={(value) => {
                  const miles = Array.isArray(value) ? value[0] : value;
                  setRadiusValue(miles);
                  onFilterChange({ radiusMiles: miles });
                }}
                minimumTrackTintColor={Colors.accent}
                maximumTrackTintColor={Colors.backgroundSubtle}
                thumbTintColor={Colors.accent}
              />
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  content: {
    backgroundColor: Colors.backgroundSubtle,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  title: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  resetText: {
    ...Typography.body,
    color: Colors.accent,
  },
  panelContent: {
    paddingVertical: Spacing.md,
  },
  sliderContainer: {
    gap: Spacing.sm,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderValue: {
    ...Typography.spec,
    color: Colors.textPrimary,
  },
});
