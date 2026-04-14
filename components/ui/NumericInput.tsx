import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { Colors, Spacing, Typography } from '../../constants';

type NumericInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  unit?: string;
  label?: string;
};

export default function NumericInput({
  value,
  onChange,
  placeholder,
  unit,
  label,
}: NumericInputProps) {
  const [raw, setRaw] = useState(value?.toString() ?? '');

  function onChangeText(text: string) {
    setRaw(text);
    if (text === '' || text === '.') {
      onChange(null);
      return;
    }
    const parsed = parseFloat(text);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  }

  function onBlur() {
    if (value === null) {
      setRaw('');
    } else {
      setRaw(value.toString());
    }
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={raw}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          keyboardType='decimal-pad'
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    flex: 1,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  unit: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
