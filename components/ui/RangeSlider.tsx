import { View, Text, StyleSheet } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import { Colors, Spacing, Typography } from '../../constants';

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  unit?: string;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  formatLabel?: (value: number) => string;
};

export default function RangeSlider({
  min,
  max,
  step = 1,
  unit,
  low,
  high,
  onChange,
  formatLabel,
}: RangeSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={styles.value}>
          {formatLabel
            ? formatLabel(low)
            : `${low.toFixed(1)}${unit ? ` ${unit}` : ''}`}
        </Text>
        <Text style={styles.value}>
          {formatLabel
            ? formatLabel(high)
            : `${high.toFixed(1)}${unit ? ` ${unit}` : ''}`}
        </Text>
      </View>
      <Slider
        value={[low, high]}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={(values) => {
          const [newLow, newHigh] = values as number[];
          onChange(newLow, newHigh);
        }}
        minimumTrackTintColor={Colors.accent}
        maximumTrackTintColor={Colors.backgroundSubtle}
        thumbTintColor={Colors.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  value: {
    ...Typography.spec,
    color: Colors.textPrimary,
  },
});
