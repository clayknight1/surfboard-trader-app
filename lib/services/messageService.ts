import { supabase } from '../supabase';
import { ThreadMessage, ThreadPreview } from '../types';

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
    const { data, error } = await supabase
      .from('threads')
      .select(
        `
    id,
    last_message,
    last_message_at,
    listing:listings(id, title, listing_photos(storage_path, is_primary)),
    buyer:users!buyer_id(id, full_name, avatar_url),
    seller:users!seller_id(id, full_name, avatar_url)
  `,
      )
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error retrieving threads:', error);
      throw new Error(error.message);
    }

    return (data as any[]).map((thread) => ({
      ...thread,
      listing: {
        ...thread.listing,
        listing_photos: thread.listing.listing_photos.map((photo: any) => ({
          ...photo,
          storage_path: supabase.storage
            .from('listings')
            .getPublicUrl(photo.storage_path).data.publicUrl,
        })),
      },
      buyer: thread.buyer,
      seller: thread.seller,
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
