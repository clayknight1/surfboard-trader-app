import { supabase } from '../supabase';
import { ListingWithPhotos } from '../types';

export async function getListing(
  listingId: string,
): Promise<ListingWithPhotos | null> {
  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_photos(*)')
    .eq('id', listingId)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }
  if (!data) {
    return null;
  }
  return data;
}

export async function getListingsByUser(
  userId: string,
): Promise<ListingWithPhotos[]> {
  console.log('USER ID', userId);
  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_photos(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  console.log('DATA', data);

  if (error) {
    console.error(error);
    throw error;
  }
  if (!data) {
    return [];
  }
  return data;
}
