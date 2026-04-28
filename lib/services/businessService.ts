import { supabase } from '../supabase';

export async function updateBusinessLocation(
  userId: string,
  lat: number,
  lng: number,
  label: string,
): Promise<void> {
  const { error } = await supabase.rpc('update_business_location', {
    p_user_id: userId,
    p_lat: lat,
    p_lng: lng,
    p_label: label,
  });

  if (error) {
    console.error('Error updating business location:', error);
    throw new Error(error.message);
  }
}

export async function upsertBusinessProfile(
  userId: string,
  payload: {
    business_name: string;
    bio: string | null;
    website: string | null;
    instagram_handle: string | null;
    location_label: string | null;
    logo_url: string | null;
    price_range_low: number | null;
    price_range_high: number | null;
  },
  isUpdate: boolean,
): Promise<void> {
  if (isUpdate) {
    const { error } = await supabase
      .from('business_profiles')
      .update(payload)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('business_profiles')
      .insert({ ...payload, user_id: userId });
    if (error) throw new Error(error.message);
  }
}
