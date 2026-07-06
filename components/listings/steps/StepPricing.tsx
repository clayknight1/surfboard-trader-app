import {
  ActivityIndicator,
  InputAccessoryView,
  Keyboard,
  Platform,
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

const DESCRIPTION_ACCESSORY_ID = 'stepPricingDoneDescription';
const PRICE_ACCESSORY_ID = 'stepPricingDonePrice';

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
              inputAccessoryViewID={
                Platform.OS === 'ios' ? PRICE_ACCESSORY_ID : undefined
              }
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
            inputAccessoryViewID={
              Platform.OS === 'ios' ? DESCRIPTION_ACCESSORY_ID : undefined
            }
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
            <ActivityIndicator color={Colors.backgroundCard} />
          ) : (
            <Text style={styles.nextButtonText}>Post listing</Text>
          )}
        </TouchableOpacity>
      )}

      {/* iOS Done toolbar for the description keyboard */}
      {Platform.OS === 'ios' && (
        <>
          <InputAccessoryView nativeID={DESCRIPTION_ACCESSORY_ID}>
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
          <InputAccessoryView nativeID={PRICE_ACCESSORY_ID}>
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
        </>
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
    marginBottom: Spacing.xs,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
  accessoryBar: {
    backgroundColor: Colors.background,
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
