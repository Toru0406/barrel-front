"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWorkerPipeline = runWorkerPipeline;
const supabase_1 = require("../../lib/supabase");
const pipeline_1 = require("../../lib/pipeline");
const VALID_CHANNELS = new Set(['twitter', 'instagram', 'newsletter', 'line']);
function toChannels(raw) {
    return raw.filter((c) => VALID_CHANNELS.has(c));
}
async function runWorkerPipeline(params) {
    const { contentSetId, topic, channels: rawChannels } = params;
    const supabase = (0, supabase_1.createServiceClient)();
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
        const results = await (0, pipeline_1.runPipeline)({
            topic,
            channels,
            apiKey,
            models: {
                heavy: process.env.PIPELINE_MODEL_HEAVY ?? pipeline_1.MODELS.heavy,
                light: process.env.PIPELINE_MODEL_LIGHT ?? pipeline_1.MODELS.light,
            },
        });
        if (results.length > 0) {
            await supabase.from('contents').insert(results.map((r) => ({
                content_set_id: contentSetId,
                channel: r.channel,
                body: r.body,
            })));
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[worker/pipeline] error for contentSetId=%s:', contentSetId, message);
        await supabase
            .from('content_sets')
            .update({ status: 'error', error: message, updated_at: new Date().toISOString() })
            .eq('id', contentSetId);
    }
}
