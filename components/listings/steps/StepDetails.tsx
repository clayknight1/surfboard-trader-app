import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Colors,
  SHAPER_BRAND_OPTIONS,
  Spacing,
  Typography,
} from '../../../constants';
import {
  BOARD_TYPE_OPTIONS,
  FIN_SYSTEM_OPTIONS,
  FIN_SETUP_OPTIONS,
} from '../../../constants';
import { StepProps } from '../../../lib/types';
import PillSelector from '../../ui/PillSelector';
import Typeahead from '../../ui/Typeahead';

export default function StepDetails({
  formData,
  updateField,
  onNext,
  onBack,
  isEditing,
}: StepProps) {
  const canContinue =
    formData.title.trim().length > 0 && formData.board_type !== null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <Text style={styles.question}>Describe your board</Text>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title*</Text>
          <TextInput
            style={styles.input}
            value={formData.title ?? ''}
            onChangeText={(value) => updateField('title', value)}
            placeholder="e.g. Channel Islands Fever 6'2"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* Shaper / Brand */}
        <Typeahead
          label='Shaper / Brand'
          value={formData.shaper_brand ?? null}
          onChange={(value) => updateField('shaper_brand', value)}
          options={SHAPER_BRAND_OPTIONS}
          placeholder='e.g. Channel Islands, Rusty, local shaper...'
        />
        {/* Board Type */}
        <PillSelector
          label='Board Type'
          options={BOARD_TYPE_OPTIONS}
          value={formData.board_type ?? null}
          onSelect={(value) => updateField('board_type', value)}
        />

        {/* Fin System */}
        <PillSelector
          label='Fin System'
          options={FIN_SYSTEM_OPTIONS}
          value={formData.fin_system ?? null}
          onSelect={(value) => updateField('fin_system', value)}
        />

        {/* Fin Setup */}
        <PillSelector
          label='Fin Setup'
          options={FIN_SETUP_OPTIONS}
          value={formData.fin_setup ?? null}
          onSelect={(value) => updateField('fin_setup', value)}
        />
      </ScrollView>

      {/* Continue button pinned outside ScrollView */}
      {!isEditing && (
        <TouchableOpacity
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
          onPress={onNext}
          disabled={!canContinue}
        >
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
  nextButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  nextButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
});
