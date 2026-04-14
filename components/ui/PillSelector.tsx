import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';
import { Keyboard } from 'react-native';

type PillSelectorProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T | null;
  onSelect: (value: T) => void;
  label?: string;
};

export default function PillSelector<T extends string>({
  options,
  value,
  onSelect,
  label,
}: PillSelectorProps<T>) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.pills}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => {
                Keyboard.dismiss();
                onSelect(option.value);
              }}
            >
              <Text
                style={[styles.pillText, isSelected && styles.pillTextSelected]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.backgroundSubtle,
  },
  pillText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  pillTextSelected: {
    color: Colors.accent,
  },
});
