import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';

type TypeaheadProps = {
  label?: string;
  value: string | null;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
};

export default function Typeahead({
  label,
  value,
  onChange,
  options,
  placeholder,
}: TypeaheadProps) {
  const [query, setQuery] = useState(value ?? '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );

  function onChangeText(text: string) {
    setQuery(text);
    onChange(text);
    setShowSuggestions(true);
  }

  function onSelect(option: string) {
    setQuery(option);
    onChange(option);
    setShowSuggestions(false);
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
      />
      {showSuggestions && filtered.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps='handled'
            style={styles.dropdownScroll}
          >
            {filtered.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.option}
                onPress={() => onSelect(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    zIndex: 10,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  dropdown: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
    zIndex: 20,
  },
  dropdownScroll: {
    borderRadius: 12,
  },
  option: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
});
