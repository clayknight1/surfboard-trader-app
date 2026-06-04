import { supabase } from '../supabase';
import * as Sentry from '@sentry/react-native';
import {
  FilterState,
  ListingCardData,
  ListingFormData,
  ListingPhoto,
  ListingWithPhotos,
} from '../types';
import { getTransformUrl } from '../utils';

export async function getListings(
  lat: number,
  lng: number,
  filters: FilterState,
  userId?: string,
  limit: number = 20,
  offset: number = 0,
): Promise<ListingCardData[]> {
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
    p_user_id: userId ?? null,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error('Supabase error:', error.message, error.code, error.details);
    Sentry.captureException(error, {
      extra: {
        code: error.code,
        details: error.details,
        lat,
        lng,
        offset,
      },
    });
    throw error;
  }

  return (data ?? []).map((listing: ListingCardData) => ({
    ...listing,
    primary_photo: listing.primary_photo
      ? getTransformUrl('listings', listing.primary_photo, 400)
      : null,
  }));
}

export async function getListing(
  listingId: string,
): Promise<ListingWithPhotos | null> {
  const { data, error } = await supabase
    .from('listings')
    .select(
      '*, listing_photos(*), public_users!listings_user_id_fkey(id, full_name, avatar_url, role, business_profiles(business_name, logo_url))',
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
    storage_path: getTransformUrl('listings', photo.storage_path, 800),
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
    .neq('status', 'deleted')
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
      storage_path: getTransformUrl('listings', photo.storage_path, 160),
    })),
  }));
}

export async function createListing(
  formData: ListingFormData,
): Promise<string> {
  const length_inches =
    formData.length_feet !== null
      ? formData.length_feet * 12 + (formData.length_inches_remainder ?? 0)
      : null;

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
    throw error;
  }

  return data;
}

export async function uploadListingPhotos(
  listingId: string,
  userId: string,
  photos: string[],
) {
  const uploadPromises = photos.map(async (photo, index) => {
    const filename = `${index}.jpg`;
    const path = `${userId}/${listingId}/${filename}`;
    const response = await fetch(photo);
    const arrayBuffer = await response.arrayBuffer();
    const isPrimary = index === 0;

    const { error: uploadError } = await supabase.storage
      .from('listings')
      .upload(path, arrayBuffer, { contentType: 'image/jpeg' });

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      throw uploadError;
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
      throw insertError;
    }
  });

  await Promise.all(uploadPromises);
}

export async function deleteListing(listingId: string): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'deleted' })
    .eq('id', listingId);

  if (error) {
    console.error('Error deleting listing:', error);
    throw new Error(error.message);
  }
}

export async function updateListing(
  listingId: string,
  formData: ListingFormData,
): Promise<void> {
  const length_inches =
    formData.length_feet !== null
      ? formData.length_feet * 12 + (formData.length_inches_remainder ?? 0)
      : null;

  const { error } = await supabase
    .from('listings')
    .update({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      board_type: formData.board_type,
      volume: formData.volume,
      length_inches,
      width_inches: formData.width_inches,
      thickness_inches: formData.thickness_inches,
      fin_system: formData.fin_system,
      fin_setup: formData.fin_setup,
      shaper_brand: formData.shaper_brand,
      condition: formData.condition,
      era: formData.era,
      listing_type: formData.listing_type,
    })
    .eq('id', listingId)
    .eq('user_id', formData.user_id);

  if (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
}

export async function updateListingLocation(
  listingId: string,
  lat: number,
  lng: number,
  label: string,
): Promise<void> {
  const { error } = await supabase.rpc('update_listing_location', {
    p_listing_id: listingId,
    p_lat: lat,
    p_lng: lng,
    p_label: label,
  });

  if (error) {
    console.error('Error updating listing location:', error);
    throw error;
  }
}

export async function markListingAsSold(listingId: string): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'sold' })
    .eq('id', listingId);

  if (error) {
    console.error('Error marking listing as sold:', error);
    throw error;
  }
}

export async function getUserListingCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching listing count:', error);
    throw error;
  }

  return count ?? 0;
}
