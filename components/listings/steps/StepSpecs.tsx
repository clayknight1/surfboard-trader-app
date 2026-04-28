import { StepProps } from '../../../lib/types';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../../constants';
import { CONDITION_OPTIONS } from '../../../constants';
import Stepper from '../../ui/Stepper';
import PillSelector from '../../ui/PillSelector';
import NumericInput from '../../ui/NumericInput';

export default function StepSpecs({
  formData,
  updateField,
  onNext,
  isEditing,
}: StepProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <Text style={styles.question}>Board specs</Text>

        {/* Volume */}
        <Stepper
          label='Volume'
          value={formData.volume ?? null}
          onChange={(value) => updateField('volume', value)}
          step={0.5}
          min={0}
          max={150}
          unit='L'
        />

        {/* Length */}
        <View style={styles.field}>
          <Text style={styles.label}>Length</Text>
          <View style={styles.lengthRow}>
            <NumericInput
              value={formData.length_feet ?? null}
              onChange={(value) => updateField('length_feet', value)}
              placeholder='5'
              unit='ft'
            />
            <NumericInput
              value={formData.length_inches_remainder ?? null}
              onChange={(value) =>
                updateField('length_inches_remainder', value)
              }
              placeholder='10.5'
              unit='in'
            />
          </View>
        </View>
        {/* Width */}
        <NumericInput
          label='Width'
          value={formData.width_inches ?? null}
          onChange={(value) => updateField('width_inches', value)}
          placeholder='20.5'
          unit='in'
        />

        {/* Thickness */}
        <NumericInput
          label='Thickness'
          value={formData.thickness_inches ?? null}
          onChange={(value) => updateField('thickness_inches', value)}
          placeholder='2.5'
          unit='in'
        />

        {/* Condition */}
        <PillSelector
          label='Condition'
          options={CONDITION_OPTIONS}
          value={formData.condition ?? null}
          onSelect={(value) => updateField('condition', value)}
        />
      </ScrollView>

      {/* Continue button */}
      {!isEditing && (
        <TouchableOpacity style={[styles.nextButton]} onPress={onNext}>
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  question: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  field: {
    gap: Spacing.sm,
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
  lengthRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  lengthFeet: {
    width: 72,
  },
  lengthInches: {
    width: 88,
  },
  lengthSeparator: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  inlineInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dimensionInput: {
    width: 120,
  },
  unit: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  nextButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  nextButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
});
