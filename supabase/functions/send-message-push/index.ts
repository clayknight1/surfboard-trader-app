import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    sender_id: string;
    recipient_id: string;
    body: string;
    listing_id: string | null;
    thread_id: string;
    created_at: string;
  } | null;
};

type ExpoPushMessage = {
  to: string;
  sound?: 'default';
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

type ExpoPushTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
};

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const payload = (await req.json()) as WebhookPayload;

    if (payload.type !== 'INSERT' || !payload.record) {
      return new Response('Ignored', { status: 200 });
    }

    const msg = payload.record;

    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', msg.recipient_id);

    if (tokensError) throw tokensError;
    if (!tokens || tokens.length === 0) {
      return new Response('No tokens', { status: 200 });
    }

    const { data: sender } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', msg.sender_id)
      .single();

    const senderName = sender?.full_name ?? 'Someone';

    const messages: ExpoPushMessage[] = tokens.map((t) => ({
      to: t.token,
      sound: 'default',
      title: senderName,
      body: msg.body.substring(0, 200),
      data: {
        type: 'message',
        threadId: msg.thread_id,
      },
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(messages),
    });

    const result: { data: ExpoPushTicket[] } = await response.json();

    if (Array.isArray(result.data)) {
      for (let i = 0; i < result.data.length; i++) {
        const ticket = result.data[i];
        if (
          ticket.status === 'error' &&
          ticket.details?.error === 'DeviceNotRegistered'
        ) {
          await supabase
            .from('push_tokens')
            .delete()
            .eq('token', tokens[i].token);
        }
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-message-push error:', err);
    return new Response(String(err), { status: 500 });
  }
});