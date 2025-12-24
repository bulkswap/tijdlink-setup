import redis from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const {
    slug,
    flow = 'verify',
    event,            // allowed | denied | visit
    lat,
    lng,
    accuracy,
    denied = false,
  } = req.body;

  if (!slug || !event) {
    return res.status(400).json({ error: 'Missing slug or event' });
  }

  const now = Date.now();

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown';

  const userAgent = req.headers['user-agent'] || 'unknown';

  const log = {
    id: `log-${slug}-${now}`,
    slug,
    flow,
    event,
    ip,
    userAgent,
    lat: lat ?? null,
    lng: lng ?? null,
    accuracy: accuracy ?? null,
    locationStatus: denied
      ? 'denied'
      : lat && lng
      ? 'allowed'
      : 'unknown',
    time: now,
  };

  /* 🔥 LOG OPSLAAN */
  await redis.set(log.id, log);

  /* 🔥 INDEX VOOR DASHBOARD */
  await redis.zadd('logs:index', {
    score: now,
    member: log.id,
  });

  return res.status(200).json({ ok: true });
}
