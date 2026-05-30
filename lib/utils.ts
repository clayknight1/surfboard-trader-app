import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { getLocales } from 'expo-localization';
import { Colors } from '../constants';

const locale = getLocales()[0];
export const measurementSystem = locale.measurementSystem ?? 'us';
export const userCurrency = locale.currencyCode ?? 'USD';

export function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat(locale.languageTag ?? 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export async function processPhoto(
  uri: string,
  maxWidth: number = 1200,
): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );

  return manipulated.uri;
}

export function getTransformUrl(
  bucket: 'listings' | 'avatars',
  path: string,
  width: number,
  quality = 60,
): string {
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const url = `${baseUrl}/storage/v1/render/image/public/${bucket}/${path}?width=${width}&quality=${quality}&resize=contain`;
  return url;
}

export function displayName(name: string | null | undefined): string {
  if (!name || !name.trim()) return 'No name set';
  return name.trim();
}

export function formatDistance(miles: number): string {
  if (measurementSystem === 'metric') {
    return `${(miles * 1.60934).toFixed(1)}km`;
  }
  return `${miles.toFixed(1)}mi`;
}

export function getCurrencySymbol(currency: string): string {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
    .format(0)
    .replace(/[\d.,\s]/g, '')
    .trim();
}

export function buildLocationLabel(
  result: Location.LocationGeocodedAddress,
): string {
  const city = result.city ?? result.subregion ?? result.district ?? 'Unknown';
  const region = result.region ?? result.country ?? '';
  return region ? `${city}, ${region}` : city;
}

export function formatLength(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainder = inches % 12;
  const wholeInches = Math.floor(remainder);
  const fraction = remainder - wholeInches;
  const fractions: Record<number, string> = {
    0.125: '⅛',
    0.25: '¼',
    0.375: '⅜',
    0.5: '½',
    0.625: '⅝',
    0.75: '¾',
    0.875: '⅞',
  };
  const nearestSixteenth = Math.round(fraction * 16) / 16;
  const fractionStr = fractions[nearestSixteenth] ?? '';
  return `${feet}'${wholeInches}${fractionStr}"`;
}

export function getConditionColor(condition: string): string {
  switch (condition) {
    case 'new':
      return Colors.conditionNew;
    case 'excellent':
      return Colors.conditionExcellent;
    case 'good':
      return Colors.conditionGood;
    case 'fair':
      return Colors.conditionFair;
    case 'poor':
      return Colors.conditionPoor;
    default:
      return Colors.textSecondary;
  }
}

export function getConditionLabel(condition: string): string {
  return condition.charAt(0).toUpperCase() + condition.slice(1);
}
