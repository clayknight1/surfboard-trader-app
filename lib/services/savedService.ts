import { supabase } from '../supabase';

export async function getSavedListings(userId: string) {
  const { data, error } = await supabase
    .from('saved_listings')
    .select(
      `
      listing_id,
      listings (
        id,
        title,
        price,
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
    throw new Error(error.message);
  }

  return (data ?? []).map((row: any) => {
    const listing = row.listings;
    const primaryPhoto =
      listing.listing_photos?.find((p: any) => p.is_primary) ??
      listing.listing_photos?.[0];
    return {
      ...listing,
      primary_photo: primaryPhoto
        ? supabase.storage
            .from('listings')
            .getPublicUrl(primaryPhoto.storage_path).data.publicUrl
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
    throw new Error(error.message);
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
    throw new Error(error.message);
  }
}

export async function isListingSaved(
  userId: string,
  listingId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('saved_listings')
    .select('listing_id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
