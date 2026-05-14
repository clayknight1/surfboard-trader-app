import * as ImageManipulator from 'expo-image-manipulator';
import { getLocales } from 'expo-localization';

const locale = getLocales()[0];
export const measurementSystem = locale.measurementSystem ?? 'us';
export const userCurrency = locale.currencyCode ?? 'USD';

export function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export async function processPhoto(
  uri: string,
  width: number,
  height: number,
): Promise<string> {
  const targetRatio = 4 / 5;
  const currentRatio = width / height;

  let cropWidth, cropHeight, originX, originY;

  if (currentRatio > targetRatio) {
    cropHeight = height;
    cropWidth = height * targetRatio;
    originX = (width - cropWidth) / 2;
    originY = 0;
  } else {
    cropWidth = width;
    cropHeight = width / targetRatio;
    originX = 0;
    originY = (height - cropHeight) / 2;
  }

  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
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
