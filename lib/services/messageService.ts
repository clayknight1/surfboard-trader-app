import { supabase } from '../supabase';
import { ThreadMessage, ThreadPreview } from '../types';
import { getTransformUrl } from '../utils';

export async function sendMessage(
  senderId: string,
  listingId: string,
  messageText: string,
  threadId?: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('send_message', {
      p_listing_id: listingId,
      p_sender_id: senderId,
      p_body: messageText,
      p_thread_id: threadId ?? null,
    });
    if (error) {
      console.error('Error sending message:', error);
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    console.error('Error sending message:', err);
    throw err;
  }
}

export async function getInbox(userId: string): Promise<ThreadPreview[]> {
  try {
    const { data, error } = await supabase.rpc('get_inbox', {
      p_user_id: userId,
    });
    if (error) {
      console.error('Error retrieving threads:', error);
      throw new Error(error.message);
    }

    return (data as any[]).map((thread) => ({
      ...thread,
      listing: {
        ...thread.listing,
        listing_photos:
          thread.listing.listing_photos?.map((photo: any) => ({
            ...photo,
            storage_path: getTransformUrl('listings', photo.storage_path, 160),
          })) ?? [],
      },
    })) as ThreadPreview[];
  } catch (err) {
    console.error('Error retrieving message:', err);
    throw err;
  }
}

export async function getMessages(threadId: string): Promise<ThreadMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error retrieving messages:', error);
      throw new Error(error.message);
    }

    return data as ThreadMessage[];
  } catch (err) {
    console.error('Error retrieving messages:', err);
    throw err;
  }
}

export async function markThreadRead(
  threadId: string,
  userId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date() })
      .eq('thread_id', threadId)
      .is('read_at', null)
      .eq('recipient_id', userId);

    if (error) {
      console.error('Error updating messages:', error);
      throw new Error(error.message);
    }
  } catch (err) {
    console.error('Error updating messages:', err);
    throw err;
  }
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .is('read_at', null);

    if (error) {
      console.error('Error retrieving message count:', error);
      throw new Error(error.message);
    }
    return count ?? 0;
  } catch (err) {
    console.error('Error retrieving message count:', err);
    throw err;
  }
}

export async function getExistingThread(
  listingId: string,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('threads')
    .select('id')
    .eq('listing_id', listingId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .maybeSingle();

  if (error) {
    console.error('Error fetching existing thread:', error);
    throw new Error(error.message);
  }

  return data?.id ?? null;
}
