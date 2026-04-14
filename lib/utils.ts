import * as ImageManipulator from 'expo-image-manipulator';

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
    [
      { crop: { originX, originY, width: cropWidth, height: cropHeight } },
      { resize: { width: 1200 } },
    ],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );

  return manipulated.uri;
}
