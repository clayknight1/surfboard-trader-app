import { ListingCardData } from './types';

export type FeedItem =
  | { type: 'listing'; data: ListingCardData }
  | { type: 'boosted'; data: ListingCardData }
  | { type: 'skeleton'; id: string };

const BOOSTED_FREQUENCY = 8;

export function buildFeed(
  organic: ListingCardData[],
  boosted: ListingCardData[] = [],
): FeedItem[] {
  const result: FeedItem[] = [];
  let boostedCounter = 0;

  organic.forEach((item, index) => {
    result.push({ type: 'listing', data: item });

    if ((index + 1) % BOOSTED_FREQUENCY === 0 && boosted[boostedCounter]) {
      result.push({ type: 'boosted', data: boosted[boostedCounter++] });
    }
  });

  return result;
}
