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
    throw error;
  }
}

export async function upsertBusinessProfile(
  userId: string,
  payload: {
    business_name: string;
    bio: string | null;
    website: string | null;
    instagram_handle: string | null;
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
    if (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from('business_profiles')
      .insert({ ...payload, user_id: userId });
    if (error) {
      console.error('Error inserting business profile:', error);
      throw error;
    }
  }
}

export async function submitBusinessApplication(
  userId: string,
  payload: {
    business_name: string;
    business_type: 'shop' | 'shaper';
    website: string | null;
    instagram_handle: string | null;
  },
): Promise<void> {
  const { error } = await supabase
    .from('business_applications')
    .insert({ ...payload, user_id: userId });
  if (error) {
    console.error('Error submitting business application:', error);
    throw error;
  }
}

export async function getMyBusinessApplication(
  userId: string,
): Promise<{ status: string; created_at: string } | null> {
  const { data, error } = await supabase
    .from('business_applications')
    .select('status, created_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('Error fetching business application:', error);
    throw error;
  }
  return data;
}
