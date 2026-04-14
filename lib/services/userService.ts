import { supabase } from '../supabase';
import { User } from '../types';

export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserLocation(
  userId: string,
  lat: number,
  lng: number,
  label: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('update_user_location', {
      p_user_id: userId,
      p_lat: lat,
      p_lng: lng,
      p_label: label,
    });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }
  } catch (err) {
    console.error('Error updating location', err);
    throw err;
  }
}
