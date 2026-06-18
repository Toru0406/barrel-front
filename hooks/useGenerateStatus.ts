'use client';
import { useEffect } from 'react';
import { createAnonClient } from '@/lib/supabase';
import { GA_EVENTS, trackEvent } from '@/lib/analytics';
import type { ContentSetStatus } from '@/lib/database.types';

export function useGenerateStatus(contentSetId: string | null) {
  useEffect(() => {
    if (!contentSetId) return;

    const supabase = createAnonClient();
    const channel = supabase
      .channel(`content_set:${contentSetId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'content_sets',
          filter: `id=eq.${contentSetId}`,
        },
        (payload) => {
          const { status, analytics_data } = payload.new as {
            status: ContentSetStatus;
            analytics_data: Record<string, unknown> | null;
          };
          if (status === 'complete') {
            trackEvent({
              action: GA_EVENTS.GENERATE_COMPLETE,
              category: 'generation',
              ...(analytics_data ?? {}),
            });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [contentSetId]);
}
