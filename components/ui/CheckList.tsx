import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants';

type CheckListProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T | null;
  onSelect: (value: T) => void;
};

export default function CheckList<T extends string>({
  options,
  value,
  onSelect,
}: CheckListProps<T>) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.row, index < options.length - 1 && styles.rowBorder]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option.label}
            </Text>
            <Ionicons
              name='checkmark'
              size={18}
              color={Colors.accent}
              style={{ opacity: isSelected ? 1 : 0 }}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 220,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  label: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.textPrimary,
  },
});
