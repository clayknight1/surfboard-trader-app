import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';

type StepperProps = {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  inputAccessoryViewID?: string;
  maxSuggest?: number;
};

export default function Stepper({
  label,
  value,
  onChange,
  step = 0.5,
  min = 0,
  max = 999,
  unit,
  inputAccessoryViewID,
  maxSuggest,
}: StepperProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toString() ?? '');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (editing) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [editing]);

  function increment() {
    const current = value ?? 0;
    const next = Math.min(max, parseFloat((current + step).toFixed(1)));
    onChange(next);
    setInputValue(next.toString());
  }

  function decrement() {
    const current = value ?? 0;
    const next = Math.max(min, parseFloat((current - step).toFixed(1)));
    onChange(next);
    setInputValue(next.toString());
  }

  function onChangeText(text: string) {
    setInputValue(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped === 0 ? null : clamped);
    } else {
      onChange(null);
    }
  }

  function onBlur() {
    setEditing(false);
    const typed = parseFloat(inputValue);
    if (maxSuggest !== undefined && !isNaN(typed) && typed > maxSuggest) {
      const suggested = parseFloat((typed / 10).toFixed(1));
      const unitLabel = unit ? ` ${unit}` : '';
      const currentValue = value ?? 0;
      Alert.alert(
        'That looks high',
        `Did you mean ${suggested}${unitLabel}? Max is ${max}${unitLabel}.`,
        [
          {
            text: `Keep ${currentValue}${unitLabel}`,
            style: 'cancel',
            onPress: () => setInputValue(currentValue.toString()),
          },
          {
            text: `Use ${suggested}${unitLabel}`,
            onPress: () => {
              onChange(suggested);
              setInputValue(suggested.toString());
            },
          },
        ],
      );
      return;
    }
    if (value === null) setInputValue('');
    else setInputValue(value.toString());
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.button}
          onPress={decrement}
          accessibilityLabel='Decrease'
          disabled={value !== null && value <= min}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.valueContainer}
          onPress={() => setEditing(true)}
          activeOpacity={1}
        >
          {editing ? (
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputValue}
              onChangeText={onChangeText}
              onBlur={onBlur}
              keyboardType='decimal-pad'
              selectTextOnFocus
              inputAccessoryViewID={inputAccessoryViewID}
            />
          ) : (
            <Text style={styles.value}>
              {value !== null ? value.toFixed(1) : '—'}
              {value !== null && unit && (
                <Text style={styles.unit}> {unit}</Text>
              )}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={increment}
          accessibilityLabel='Increase'
          disabled={value !== null && value >= max}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...Typography.displaySmall,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  valueContainer: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...Typography.specLarge,
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 80,
  },
  unit: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  input: {
    ...Typography.specLarge,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
});
