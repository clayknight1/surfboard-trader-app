import { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants';
import { updateUserCurrency } from '../../lib/services/userService';
import { useAuth } from '../../lib/auth';
import { getLocales } from 'expo-localization';
import * as Sentry from '@sentry/react-native';
import { userCurrency } from '../../lib/utils';

const CURRENCIES = [
  { label: 'US Dollar', value: 'USD', symbol: '$' },
  { label: 'Australian Dollar', value: 'AUD', symbol: 'A$' },
  { label: 'British Pound', value: 'GBP', symbol: '£' },
  { label: 'Euro', value: 'EUR', symbol: '€' },
  { label: 'New Zealand Dollar', value: 'NZD', symbol: 'NZ$' },
  { label: 'South African Rand', value: 'ZAR', symbol: 'R' },
  { label: 'Mexican Peso', value: 'MXN', symbol: 'MX$' },
  { label: 'Brazilian Real', value: 'BRL', symbol: 'R$' },
];

type CurrencySheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CurrencySheet({ isOpen, onClose }: CurrencySheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { session, profile, refreshProfile } = useAuth();
  const userId = session?.user?.id;

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  async function handleSelect(currency: string) {
    if (!userId) {
      return;
    }
    try {
      await updateUserCurrency(userId, currency);
      await refreshProfile();
      onClose();
    } catch (err) {
      Sentry.captureException(err);
      Alert.alert(
        'Something went wrong',
        'Could not update currency. Please try again.',
      );
    }
  }

  async function useLocalCurrency() {
    const locale = getLocales()[0];
    const currency = locale.currencyCode ?? 'USD';
    await handleSelect(currency);
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['60%']}
      enablePanDownToClose
      onChange={handleSheetChange}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>Currency</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {CURRENCIES.map((currency) => {
            const isSelected = profile?.currency === currency.value;
            return (
              <TouchableOpacity
                key={currency.value}
                style={styles.row}
                onPress={() => handleSelect(currency.value)}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.symbol}>{currency.symbol}</Text>
                  <View>
                    <Text style={styles.label}>{currency.label}</Text>
                    <Text style={styles.code}>{currency.value}</Text>
                  </View>
                </View>
                {isSelected && (
                  <Ionicons name='checkmark' size={20} color={Colors.accent} />
                )}
              </TouchableOpacity>
            );
          })}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.localButton}
            onPress={useLocalCurrency}
          >
            <Ionicons
              name='location-outline'
              size={18}
              color={Colors.textPrimary}
            />
            <Text style={styles.localButtonText}>
              Use my device region ({userCurrency})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.backgroundSheet,
  },
  handleIndicator: {
    backgroundColor: Colors.border,
  },
  container: {
    padding: Spacing.screenPadding,
    gap: Spacing.lg,
    flex: 1,
  },
  title: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  symbol: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    width: 32,
  },
  label: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  code: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  localButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: Spacing.xl,
  },
  localButtonText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
});
