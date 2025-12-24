import redis from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const {
    slug,
    flow = 'verify',
    event,
    lat,
    lng,
    accuracy,
    denied = false,
  } = req.body;

  if (!slug || !event) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const now = Date.now();

  const log = {
    id: `log-${slug}-${now}`,
    slug,
    flow,
    event,
    lat: lat ?? null,
    lng: lng ?? null,
    accuracy: accuracy ?? null,
    locationStatus: denied ? 'denied' : lat ? 'allowed' : 'unknown',
    time: now,
  };

  // ✅ log opslaan
  await redis.set(log.id, log);

  // ✅ index bijwerken (belangrijk voor dashboard!)
  await redis.zadd('logs:index', {
    score: now,
    member: log.id,
  });

  return res.status(200).json({ ok: true });
}
