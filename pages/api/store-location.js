import redis from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const {
    slug,
    flow = 'verify',
    event,              // visit | allowed | denied
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

  const id = `log-${slug}-${now}-${Math.random().toString(36).slice(2)}`;

  const log = {
    id,
    slug,
    flow,
    event,                     // visit | allowed | denied
    eventType: 'location',     // 🔑 CRUCIAAL
    ip,
    userAgent,

    lat: typeof lat === 'number' ? lat : null,
    lng: typeof lng === 'number' ? lng : null,
    accuracy: accuracy ?? null,

    locationStatus: denied
      ? 'denied'
      : lat && lng
      ? 'allowed'
      : 'unknown',

    time: now,
  };

  // 🔥 opslaan
  await redis.set(id, log);

  // 🔥 indexeren voor dashboard
  await redis.zadd('logs:index', {
    score: now,
    member: id,
  });

  return res.status(200).json({ ok: true });
}
