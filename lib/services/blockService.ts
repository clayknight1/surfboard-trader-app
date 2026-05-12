import { supabase } from '../supabase';
import * as Sentry from '@sentry/react-native';

export async function blockUser(
  blockerId: string,
  blockedId: string,
): Promise<void> {
  const { error } = await supabase
    .from('blocked_users')
    .insert({ blocker_id: blockerId, blocked_id: blockedId });

  if (error) {
    console.error('Error blocking user:', error);
    throw new Error(error.message);
  }
}

export async function unblockUser(
  blockerId: string,
  blockedId: string,
): Promise<void> {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) {
    console.error('Error unblocking user:', error);
    throw new Error(error.message);
  }
}

export async function getBlockedUsers(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', userId);

  if (error) {
    console.error('Error fetching blocked users:', error);
    Sentry.captureException(new Error(error.message));
    return [];
  }

  return data.map((row) => row.blocked_id);
}

export async function isUserBlocked(
  blockerId: string,
  blockedId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle();

  if (error) {
    Sentry.captureException(new Error(error.message));
    return false;
  }
  return !!data;
}

export async function submitReport(
  reporterId: string,
  reason: string,
  reportedUserId?: string,
  reportedListingId?: string,
): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    reporter_id: reporterId,
    reason,
    reported_user_id: reportedUserId ?? null,
    reported_listing_id: reportedListingId ?? null,
  });

  if (error) {
    console.error('Error submitting report:', error);
    throw new Error(error.message);
  }
}

export async function getBlockedUsersWithProfiles(userId: string) {
  const { data, error } = await supabase
    .from('blocked_users')
    .select(
      'blocked_id, users!blocked_users_blocked_id_fkey(id, full_name, avatar_url)',
    )
    .eq('blocker_id', userId);

  if (error) {
    console.error('Error fetching blocked users:', error);
    Sentry.captureException(new Error(error.message));
    return [];
  }

  return data.map((row: any) => row.users);
}
