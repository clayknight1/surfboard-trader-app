import { supabase } from '../supabase';
import { getTransformUrl } from '../utils';
import * as Sentry from '@sentry/react-native';

export async function getSavedListings(userId: string) {
  const { data, error } = await supabase
    .from('saved_listings')
    .select(
      `
      listing_id,
      listings (
        id,
        status,
        title,
        price,
        currency,
        volume,
        length_inches,
        board_type,
        fin_system,
        fin_setup,
        condition,
        location_label,
        is_sponsored,
        listing_type,
        user_id,
        listing_photos (storage_path, is_primary)
      )
    `,
    )
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved listings:', error);
    throw error;
  }

  return (data ?? [])
    .filter((row: any) => row.listings && row.listings.status !== 'deleted')
    .map((row: any) => {
      const listing = row.listings;
      const primaryPhoto =
        listing.listing_photos?.find((p: any) => p.is_primary) ??
        listing.listing_photos?.[0];
      return {
        ...listing,
        primary_photo: primaryPhoto
          ? getTransformUrl('listings', primaryPhoto.storage_path, 400)
          : null,
        distance_miles: 0,
      };
    });
}

export async function saveListing(
  userId: string,
  listingId: string,
): Promise<void> {
  const { error } = await supabase
    .from('saved_listings')
    .insert({ user_id: userId, listing_id: listingId });

  if (error) {
    console.error('Error saving listing:', error);
    throw error;
  }
}

export async function unsaveListing(
  userId: string,
  listingId: string,
): Promise<void> {
  const { error } = await supabase
    .from('saved_listings')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);

  if (error) {
    console.error('Error unsaving listing:', error);
    throw error;
  }
}

export async function getSavedListingIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_listings')
    .select('listing_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching saved IDs:', error);
    Sentry.captureException(error);
    return [];
  }
  return data.map((row) => row.listing_id);
}
