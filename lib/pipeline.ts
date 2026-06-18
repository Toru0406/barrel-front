import Anthropic from '@anthropic-ai/sdk';
import type { Channel } from './database.types';

export const MODELS = {
  heavy: 'claude-opus-4-8',
  light: 'claude-haiku-4-5-20251001',
} as const;

const CHANNEL_PROMPTS: Record<Channel, (topic: string) => string> = {
  twitter: (topic) =>
    `以下のトピックについてX(旧Twitter)向けの投稿文を日本語で作成してください。140文字以内で、ハッシュタグを2〜3個含めてください。\n\nトピック: ${topic}`,
  instagram: (topic) =>
    `以下のトピックについてInstagram向けのキャプションを日本語で作成してください。絵文字を適度に含め、ハッシュタグを5〜10個含めてください。\n\nトピック: ${topic}`,
  newsletter: (topic) =>
    `以下のトピックについてメールニュースレター向けの本文を日本語で作成してください。件名と本文を含め、300〜500文字程度でまとめてください。\n\nトピック: ${topic}`,
  line: (topic) =>
    `以下のトピックについてLINE公式アカウント向けのメッセージを日本語で作成してください。親しみやすいトーンで200文字以内にまとめてください。\n\nトピック: ${topic}`,
};

export async function callClaude(
  prompt: string,
  model: string,
  apiKey: string,
): Promise<string> {
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected non-text content from Claude');
  return block.text;
}

export interface PipelineInput {
  topic: string;
  channels: Channel[];
  apiKey: string;
  models?: { heavy?: string; light?: string };
}

export interface ChannelResult {
  channel: Channel;
  body: string;
}

export async function runPipeline(input: PipelineInput): Promise<ChannelResult[]> {
  const { topic, channels, apiKey, models = {} } = input;
  const heavyModel = models.heavy ?? MODELS.heavy;
  const lightModel = models.light ?? MODELS.light;

  const settled = await Promise.allSettled(
    channels.map(async (channel): Promise<ChannelResult> => {
      // Use the heavy model for long-form content, light for short-form
      const model = channel === 'newsletter' ? heavyModel : lightModel;
      const body = await callClaude(CHANNEL_PROMPTS[channel](topic), model, apiKey);
      return { channel, body };
    }),
  );

  return settled
    .filter((r): r is PromiseFulfilledResult<ChannelResult> => r.status === 'fulfilled')
    .map((r) => r.value);
}
