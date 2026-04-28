import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ListingType, StepProps, User } from '../../../lib/types';
import { Colors, Spacing, Typography } from '../../../constants';

type StepTypeProps = StepProps & {
  profile: User | null;
};

type ListingOption = {
  value: ListingType;
  label: string;
  subtext: string;
};

export default function StepType({
  profile,
  formData,
  updateField,
  onNext,
}: StepTypeProps) {
  const role = profile?.role;
  const isShopOrShaper = role === 'shop' || role === 'shaper';

  const options: ListingOption[] = isShopOrShaper
    ? [
        {
          value: 'for_sale',
          label: role === 'shop' ? 'Used / Trade-in' : 'Used / Demo',
          subtext:
            role === 'shop' ? 'pre-owned boards' : 'pre-owned or demo boards',
        },
        {
          value: 'in_stock',
          label: 'In Stock',
          subtext:
            role === 'shop'
              ? 'new boards off the rack'
              : 'stock shapes off the rack',
        },
        ...(role === 'shaper'
          ? [
              {
                value: 'custom_order' as ListingType,
                label: 'Custom Order',
                subtext: 'take orders for new builds',
              },
            ]
          : []),
        { value: 'vintage', label: 'Vintage', subtext: 'boards to collect' },
      ]
    : [
        { value: 'for_sale', label: 'Regular', subtext: 'boards to surf' },
        { value: 'vintage', label: 'Vintage', subtext: 'boards to collect' },
      ];

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What kind of listing is this?</Text>

      <View style={styles.options}>
        {options.map((option) => {
          const isSelected = formData.listing_type === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isSelected && styles.optionActive]}
              onPress={() => updateField('listing_type', option.value)}
            >
              <View>
                <Text
                  style={[
                    styles.optionTitle,
                    isSelected && styles.optionTitleActive,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.optionSubtext}>{option.subtext}</Text>
              </View>
              {isSelected && <View style={styles.checkDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.screenPadding,
    gap: Spacing.xl,
  },
  question: {
    ...Typography.heading,
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
  },
  options: {
    gap: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  optionActive: {
    borderColor: Colors.accent,
  },
  optionTitle: {
    ...Typography.body,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  optionTitleActive: {
    color: Colors.textPrimary,
  },
  optionSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  nextButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  nextButtonText: {
    ...Typography.subheading,
    fontFamily: Typography.fontBold,
    color: Colors.backgroundCard,
  },
});
