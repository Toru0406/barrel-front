export const GA_EVENTS = {
  GENERATE_START: 'generate_start',
  GENERATE_COMPLETE: 'generate_complete',
} as const;

export interface TrackEventParams {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

type GTag = (command: string, action: string, params: Record<string, unknown>) => void;

export function trackEvent({ action, category, label, value, ...rest }: TrackEventParams): void {
  // Works in browser; no-op in Node (worker never calls this function)
  const g = globalThis as Record<string, unknown>;
  if (typeof g['window'] === 'undefined') return;
  const gtag = (g['window'] as Record<string, unknown>)['gtag'];
  if (typeof gtag !== 'function') return;
  (gtag as GTag)('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  });
}
