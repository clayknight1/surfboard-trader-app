import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StepProps } from '../../../lib/types';
import { Colors, Spacing, Typography } from '../../../constants';
import { useAuth } from '../../../lib/auth';
import { getCurrencySymbol, userCurrency } from '../../../lib/utils';

type StepPricingProps = StepProps & {
  handleSubmit: () => void;
  isSubmitting: boolean;
};

export default function StepPricing({
  formData,
  updateField,
  handleSubmit,
  isSubmitting,
  isEditing,
}: StepPricingProps) {
  const { profile } = useAuth();
  const canContinue = formData.price !== null && formData.price > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <Text style={styles.question}>Pricing & description</Text>

        {/* Price */}
        <View style={styles.field}>
          <Text style={styles.label}>Price</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currencySymbol}>
              {getCurrencySymbol(profile?.currency ?? userCurrency)}
            </Text>
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={formData.price ? (formData.price / 100).toString() : ''}
              onChangeText={(text) => {
                const dollars = parseFloat(text);
                updateField(
                  'price',
                  isNaN(dollars) ? null : Math.round(dollars * 100),
                );
              }}
              placeholder='0'
              placeholderTextColor={Colors.textSecondary}
              keyboardType='decimal-pad'
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={formData.description ?? ''}
            onChangeText={(text) => updateField('description', text)}
            placeholder='Describe the board, condition details, any repairs...'
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical='top'
          />
        </View>
      </ScrollView>
      {!isEditing && (
        <TouchableOpacity
          style={[
            styles.nextButton,
            (isSubmitting || !canContinue) && styles.nextButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !canContinue}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.accent} />
          ) : (
            <Text style={styles.nextButtonText}>Post listing</Text>
          )}
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
  },
  currencySymbol: {
    ...Typography.subheading,
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
  priceInput: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingLeft: Spacing.sm,
  },
  descriptionInput: {
    height: 160,
    paddingTop: 14,
  },
  nextButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
});
