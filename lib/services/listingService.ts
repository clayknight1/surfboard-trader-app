import { supabase } from '../supabase';
import {
  FilterState,
  ListingCardData,
  ListingFormData,
  ListingPhoto,
  ListingWithPhotos,
} from '../types';
import * as FileSystem from 'expo-file-system';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export async function getListings(
  lat: number,
  lng: number,
  filters: FilterState,
): Promise<ListingCardData[]> {
  try {
    const { data, error } = await supabase.rpc('get_listings_nearby', {
      p_lat: lat,
      p_lng: lng,
      p_radius_miles: filters.radiusMiles,
      p_volume_min: filters.volumeMin ?? undefined,
      p_volume_max: filters.volumeMax ?? undefined,
      p_board_type: filters.boardType ?? undefined,
      p_fin_system: filters.finSystem ?? undefined,
      p_price_max: filters.priceMax ?? undefined,
      p_listing_type: filters.listingType ?? undefined,
      p_length_min: filters.lengthMin ?? undefined,
      p_length_max: filters.lengthMax ?? undefined,
    });

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    return (data ?? []).map((listing: ListingCardData) => ({
      ...listing,
      primary_photo: listing.primary_photo
        ? supabase.storage.from('listings').getPublicUrl(listing.primary_photo)
            .data.publicUrl
        : null,
    }));
  } catch (err) {
    console.error('Error fetching listings:', err);
    return [];
  }
}

export async function getListing(
  listingId: string,
): Promise<ListingWithPhotos | null> {
  const { data, error } = await supabase
    .from('listings')
    .select(
      '*, listing_photos(*), users!listings_user_id_fkey(id, full_name, avatar_url)',
    )
    .eq('id', listingId)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }
  if (!data) {
    return null;
  }
  const photos = data.listing_photos.map((photo: ListingPhoto) => ({
    ...photo,
    storage_path: supabase.storage
      .from('listings')
      .getPublicUrl(photo.storage_path).data.publicUrl,
  }));
  return { ...data, listing_photos: photos };
}

export async function getListingsByUser(
  userId: string,
): Promise<ListingWithPhotos[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_photos(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }
  if (!data) {
    return [];
  }
  return data.map((listing) => ({
    ...listing,
    listing_photos: listing.listing_photos.map((photo: ListingPhoto) => ({
      ...photo,
      storage_path: supabase.storage
        .from('listings')
        .getPublicUrl(photo.storage_path).data.publicUrl,
    })),
  }));
}

export async function createListing(
  formData: ListingFormData,
): Promise<string> {
  const length_inches =
    formData.length_feet !== null && formData.length_inches_remainder !== null
      ? formData.length_feet * 12 + formData.length_inches_remainder
      : null;

  try {
    const { data, error } = await supabase.rpc('create_listing', {
      p_board_type: formData.board_type,
      p_condition: formData.condition,
      p_currency: formData.currency,
      p_description: formData.description,
      p_era: formData.era,
      p_fin_setup: formData.fin_setup,
      p_fin_system: formData.fin_system,
      p_is_rideable: formData.is_rideable,
      p_lat: formData.lat,
      p_lead_time_weeks: formData.lead_time_weeks,
      p_length_inches: length_inches,
      p_listing_type: formData.listing_type,
      p_lng: formData.lng,
      p_location_label: formData.location_label,
      p_price: formData.price,
      p_provenance: formData.provenance,
      p_shaper_brand: formData.shaper_brand,
      p_thickness_inches: formData.thickness_inches,
      p_title: formData.title,
      p_user_id: formData.user_id,
      p_volume: formData.volume,
      p_width_inches: formData.width_inches,
    });
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Error updating location', err);
    throw err;
  }
}

export async function uploadListingPhotos(
  listingId: string,
  userId: string,
  photos: string[],
) {
  const uploadPromises = photos.map(async (photo, index) => {
    const filename = `${index}.jpg`;
    const path = `${userId}/${listingId}/${filename}`;

    // const base64 = await readAsStringAsync(photo, {
    //   encoding: 'base64',
    // });
    // const arrayBuffer = decode(base64);
    const response = await fetch(photo);
    const arrayBuffer = await response.arrayBuffer();
    const isPrimary = index === 0;

    const { error: uploadError } = await supabase.storage
      .from('listings')
      .upload(path, arrayBuffer, { contentType: 'image/jpeg' });

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      throw new Error(uploadError.message);
    }

    const { error: insertError } = await supabase
      .from('listing_photos')
      .insert({
        listing_id: listingId,
        storage_path: path,
        is_primary: isPrimary,
        display_order: index,
      });

    if (insertError) {
      console.error('Error inserting photo record:', insertError);
      throw new Error(insertError.message);
    }
  });

  await Promise.all(uploadPromises);
}

export async function deleteListing(listingId: string): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId);

  if (error) {
    console.error('Error deleting listing:', error);
    throw new Error(error.message);
  }
}
