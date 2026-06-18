import express from 'express';
import { runWorkerPipeline } from './pipeline';

const app = express();
app.use(express.json());

const TRIGGER_SECRET = process.env.TRIGGER_SECRET ?? '';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/generate', (req, res) => {
  const secret = req.headers['x-trigger-secret'];
  if (!TRIGGER_SECRET || secret !== TRIGGER_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { contentSetId, topic, channels } = req.body as {
    contentSetId?: string;
    topic?: string;
    channels?: string[];
  };

  if (!contentSetId || !topic || !Array.isArray(channels) || channels.length === 0) {
    res.status(400).json({ error: 'contentSetId, topic, and channels are required' });
    return;
  }

  // Respond immediately; processing continues in background
  res.status(202).json({ accepted: true });

  runWorkerPipeline({ contentSetId, topic, channels }).catch((err: unknown) => {
    console.error('[worker] unhandled pipeline error:', err);
  });
});

app.listen(PORT, () => {
  console.log(`[worker] listening on :${PORT}`);
});
