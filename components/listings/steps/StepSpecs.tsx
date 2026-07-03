import { StepProps } from '../../../lib/types';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../../constants';
import { CONDITION_OPTIONS } from '../../../constants';
import Stepper from '../../ui/Stepper';
import PillSelector from '../../ui/PillSelector';
import NumericInput from '../../ui/NumericInput';

const IDS = {
  volume: 'stepSpecsDoneVolume',
  lengthFt: 'stepSpecsDoneLengthFt',
  lengthIn: 'stepSpecsDoneLengthIn',
  width: 'stepSpecsDoneWidth',
  thickness: 'stepSpecsDoneThickness',
};

const idIOS = (id: string) => (Platform.OS === 'ios' ? id : undefined);

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
          onChange={(value) =>
            updateField('volume', value === 0 ? null : value)
          }
          step={0.5}
          min={0}
          max={150}
          unit='L'
          inputAccessoryViewID={idIOS(IDS.volume)}
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
              inputAccessoryViewID={idIOS(IDS.lengthFt)}
            />
            <NumericInput
              value={formData.length_inches_remainder ?? null}
              onChange={(value) =>
                updateField('length_inches_remainder', value)
              }
              placeholder='10.5'
              unit='in'
              inputAccessoryViewID={idIOS(IDS.lengthIn)}
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
          inputAccessoryViewID={idIOS(IDS.width)}
        />

        {/* Thickness */}
        <NumericInput
          label='Thickness'
          value={formData.thickness_inches ?? null}
          onChange={(value) => updateField('thickness_inches', value)}
          placeholder='2.5'
          unit='in'
          inputAccessoryViewID={idIOS(IDS.thickness)}
        />

        {/* Condition */}
        {formData.listing_type !== 'in_stock' &&
          formData.listing_type !== 'custom_order' && (
            <PillSelector
              label='Condition'
              options={CONDITION_OPTIONS}
              value={formData.condition ?? null}
              onSelect={(value) => updateField('condition', value)}
            />
          )}
      </ScrollView>

      {/* Continue button */}
      {!isEditing && (
        <TouchableOpacity style={[styles.nextButton]} onPress={onNext}>
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      )}

      {/* iOS keyboard Done toolbars — one per input */}
      {Platform.OS === 'ios' &&
        Object.values(IDS).map((id) => (
          <InputAccessoryView key={id} nativeID={id}>
            <View style={styles.accessoryBar}>
              <TouchableOpacity
                onPress={() => Keyboard.dismiss()}
                hitSlop={10}
                accessibilityLabel='Done'
              >
                <Text style={styles.accessoryDone}>Done</Text>
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        ))}
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
  lengthRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
  accessoryBar: {
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  accessoryDone: {
    ...Typography.body,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
});
