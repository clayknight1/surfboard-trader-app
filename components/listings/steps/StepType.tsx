import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ListingType, StepProps, User } from '../../../lib/types';
import { Colors, Spacing, Typography } from '../../../constants';

type StepTypeProps = StepProps & {
  profile: User | null;
};

export default function StepType({
  profile,
  formData,
  updateField,
  onNext,
}: StepTypeProps) {
  const role = profile?.role;

  function onSelect(selection: ListingType): void {
    updateField('listing_type', selection);
  }

  const isShopOrShaper = role === 'shop' || role === 'shaper';

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What kind of listing is this?</Text>

      {/* Main toggle — Regular vs Vintage */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            formData.listing_type === 'for_sale' && styles.toggleOptionActive,
          ]}
          onPress={() => onSelect('for_sale')}
        >
          <Text
            style={[
              styles.toggleLabel,
              formData.listing_type === 'for_sale' && styles.toggleLabelActive,
            ]}
          >
            Regular
          </Text>
          <Text
            style={[
              styles.toggleSubtext,
              formData.listing_type === 'for_sale' &&
                styles.toggleSubtextActive,
            ]}
          >
            boards to surf
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleOption,
            formData.listing_type === 'vintage' && styles.toggleOptionActive,
          ]}
          onPress={() => onSelect('vintage')}
        >
          <Text
            style={[
              styles.toggleLabel,
              formData.listing_type === 'vintage' && styles.toggleLabelActive,
            ]}
          >
            Vintage
          </Text>
          <Text
            style={[
              styles.toggleSubtext,
              formData.listing_type === 'vintage' && styles.toggleSubtextActive,
            ]}
          >
            boards to collect
          </Text>
        </TouchableOpacity>
      </View>

      {/* Shop / Shaper additional options */}
      {isShopOrShaper && (
        <View style={styles.businessOptions}>
          <Text style={styles.businessLabel}>Business listing types</Text>

          <TouchableOpacity
            style={[
              styles.businessOption,
              formData.listing_type === 'in_stock' &&
                styles.businessOptionActive,
            ]}
            onPress={() => onSelect('in_stock')}
          >
            <View>
              <Text
                style={[
                  styles.businessOptionTitle,
                  formData.listing_type === 'in_stock' &&
                    styles.businessOptionTitleActive,
                ]}
              >
                In stock
              </Text>
              <Text style={styles.businessOptionSubtext}>
                new boards ready to go
              </Text>
            </View>
            {formData.listing_type === 'in_stock' && (
              <View style={styles.checkDot} />
            )}
          </TouchableOpacity>

          {role === 'shaper' && (
            <TouchableOpacity
              style={[
                styles.businessOption,
                formData.listing_type === 'custom_order' &&
                  styles.businessOptionActive,
              ]}
              onPress={() => onSelect('custom_order')}
            >
              <View>
                <Text
                  style={[
                    styles.businessOptionTitle,
                    formData.listing_type === 'custom_order' &&
                      styles.businessOptionTitleActive,
                  ]}
                >
                  Custom order
                </Text>
                <Text style={styles.businessOptionSubtext}>
                  take orders for new builds
                </Text>
              </View>
              {formData.listing_type === 'custom_order' && (
                <View style={styles.checkDot} />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Next button */}
      <TouchableOpacity style={[styles.nextButton]} onPress={onNext}>
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
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 4,
  },
  toggleOptionActive: {
    backgroundColor: Colors.backgroundCard,
  },
  toggleLabel: {
    ...Typography.body,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  toggleLabelActive: {
    color: Colors.textOnCard,
  },
  toggleSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  toggleSubtextActive: {
    color: Colors.textOnCardMuted,
  },
  businessOptions: {
    gap: Spacing.sm,
  },
  businessLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  businessOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  businessOptionActive: {
    borderColor: Colors.accent,
  },
  businessOptionTitle: {
    ...Typography.body,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  businessOptionTitleActive: {
    color: Colors.textPrimary,
  },
  businessOptionSubtext: {
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
