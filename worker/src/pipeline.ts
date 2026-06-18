import { createServiceClient } from '../../lib/supabase';
import { runPipeline, MODELS } from '../../lib/pipeline';
import type { Channel } from '../../lib/database.types';

const VALID_CHANNELS = new Set<string>(['twitter', 'instagram', 'newsletter', 'line']);

function toChannels(raw: string[]): Channel[] {
  return raw.filter((c): c is Channel => VALID_CHANNELS.has(c));
}

export async function runWorkerPipeline(params: {
  contentSetId: string;
  topic: string;
  channels: string[];
}): Promise<void> {
  const { contentSetId, topic, channels: rawChannels } = params;
  const supabase = createServiceClient();
  const apiKey = process.env.ANTHROPIC_API_KEY ?? '';
  const channels = toChannels(rawChannels);

  if (channels.length === 0) {
    await supabase
      .from('content_sets')
      .update({ status: 'error', error: 'No valid channels', updated_at: new Date().toISOString() })
      .eq('id', contentSetId);
    return;
  }

  await supabase
    .from('content_sets')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', contentSetId);

  try {
    const results = await runPipeline({
      topic,
      channels,
      apiKey,
      models: {
        heavy: process.env.PIPELINE_MODEL_HEAVY ?? MODELS.heavy,
        light: process.env.PIPELINE_MODEL_LIGHT ?? MODELS.light,
      },
    });

    if (results.length > 0) {
      await supabase.from('contents').insert(
        results.map((r) => ({
          content_set_id: contentSetId,
          channel: r.channel,
          body: r.body,
        })),
      );
    }

    const succeededChannels = results.map((r) => r.channel);
    const failedChannels = channels.filter((c) => !succeededChannels.includes(c));

    await supabase
      .from('content_sets')
      .update({
        status: results.length > 0 ? 'complete' : 'error',
        analytics_data: {
          succeeded_channels: succeededChannels,
          failed_channels: failedChannels,
          total_channels: channels.length,
        },
        error: failedChannels.length > 0 ? `Failed channels: ${failedChannels.join(', ')}` : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contentSetId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[worker/pipeline] error for contentSetId=%s:', contentSetId, message);
    await supabase
      .from('content_sets')
      .update({ status: 'error', error: message, updated_at: new Date().toISOString() })
      .eq('id', contentSetId);
  }
}
