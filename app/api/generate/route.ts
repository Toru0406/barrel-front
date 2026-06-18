import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { env } from '@/lib/env';
import type { Channel } from '@/lib/database.types';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { topic, channels, userId } = body as {
    topic?: string;
    channels?: Channel[];
    userId?: string;
  };

  if (!topic || !channels || channels.length === 0 || !userId) {
    return NextResponse.json(
      { error: 'topic, channels, and userId are required' },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const { data: contentSet, error: insertError } = await supabase
    .from('content_sets')
    .insert({ user_id: userId, status: 'pending' })
    .select('id')
    .single();

  if (insertError || !contentSet) {
    console.error('[api/generate] insert error:', insertError);
    return NextResponse.json({ error: 'Failed to create content set' }, { status: 500 });
  }

  if (!env.workerUrl || !env.triggerSecret) {
    return NextResponse.json({ error: 'Worker not configured' }, { status: 503 });
  }

  // Worker responds 202 immediately; fire-and-forget from our perspective
  await fetch(`${env.workerUrl}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-trigger-secret': env.triggerSecret,
    },
    body: JSON.stringify({ contentSetId: contentSet.id, topic, channels }),
  }).catch((err) => {
    console.error('[api/generate] failed to reach worker:', err);
  });

  return NextResponse.json({ contentSetId: contentSet.id }, { status: 202 });
}
