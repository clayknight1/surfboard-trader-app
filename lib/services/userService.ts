import { supabase } from '../supabase';
import { ListingCardData, PublicListing, PublicProfile, User } from '../types';
import { getTransformUrl } from '../utils';
import * as Sentry from '@sentry/react-native';

export async function getUserProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*, business_profiles(*)')
    .eq('id', userId)
    .single();

  if (error) {
    Sentry.captureException(error);
    throw error;
  }
  return data;
}

export async function updateUserLocation(
  userId: string,
  lat: number,
  lng: number,
  label: string,
): Promise<void> {
  const { error } = await supabase.rpc('update_user_location', {
    p_user_id: userId,
    p_lat: lat,
    p_lng: lng,
    p_label: label,
  });

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: { full_name?: string; avatar_url?: string },
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function uploadAvatar(
  userId: string,
  uri: string,
): Promise<string> {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const path = `${userId}/avatar.jpg`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }

  return getTransformUrl('avatars', path, 160);
}

export async function getPublicProfile(userId: string): Promise<PublicProfile> {
  const { data, error } = await supabase
    .from('public_users')
    .select(
      'id, full_name, avatar_url, role, location_label, created_at, business_profiles(*)',
    )
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching public profile:', error);
    throw error;
  }

  return data;
}

export async function getPublicListings(
  userId: string,
): Promise<ListingCardData[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_photos(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public listings:', error);
    throw error;
  }

  return (data ?? []).map((listing) => {
    const primaryPhoto =
      listing.listing_photos?.find((p: any) => p.is_primary) ??
      listing.listing_photos?.[0];
    return {
      ...listing,
      primary_photo: primaryPhoto
        ? getTransformUrl('listings', primaryPhoto.storage_path, 400)
        : null,
      distance_miles: 0,
    } as unknown as ListingCardData;
  });
}

export async function submitDeletionRequest(userId: string): Promise<void> {
  const { error } = await supabase
    .from('deletion_requests')
    .insert({ user_id: userId });

  if (error) {
    console.error('Error submitting deletion request:', error);
    throw error;
  }
}

export async function updateUserCurrency(
  userId: string,
  currency: string,
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ currency })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user currency:', error);
    throw error;
  }
}
