import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Colors, Spacing, Typography } from '../../constants';

type NumericInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  unit?: string;
  label?: string;
  inputAccessoryViewID?: string;
  maxSuggest?: number;
};

export default function NumericInput({
  value,
  onChange,
  placeholder,
  unit,
  label,
  inputAccessoryViewID,
  maxSuggest,
}: NumericInputProps) {
  const [raw, setRaw] = useState(value?.toString() ?? '');
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setRaw(value?.toString() ?? '');
    }
  }, [value]);

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
    isFocused.current = false;
    if (maxSuggest !== undefined && value !== null && value > maxSuggest) {
      const suggested = parseFloat((value / 10).toFixed(1));
      const unitLabel = unit ? ` ${unit}` : '';
      Alert.alert('That looks high', `Did you mean ${suggested}${unitLabel}?`, [
        {
          text: `Keep ${value}${unitLabel}`,
          style: 'cancel',
          onPress: () => setRaw(value.toString()),
        },
        {
          text: `Use ${suggested}${unitLabel}`,
          onPress: () => {
            onChange(suggested);
            setRaw(suggested.toString());
          },
        },
      ]);
      return;
    }
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
          onFocus={() => {
            isFocused.current = true;
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          keyboardType='decimal-pad'
          inputAccessoryViewID={inputAccessoryViewID}
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
