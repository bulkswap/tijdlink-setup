import redis from '../../lib/redis';

export default async function handler(req, res) {
  try {
    const { slug, lat, lng, accuracy, denied, flow, event } = req.body;

    if (!slug) {
      return res.status(400).json({ error: 'Missing slug' });
    }

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    await redis.set(`log-${slug}-${Date.now()}`, {
      slug,
      ip,
      userAgent,
      lat: lat ?? null,
      lng: lng ?? null,
      accuracy: accuracy ?? null,
      locationStatus: denied ? 'denied' : lat ? 'allowed' : 'unknown',
      flow: flow ?? 'unknown',
      event: event ?? 'visit', // visit | allowed | denied
      time: Date.now(),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('store-location error', err);
    return res.status(500).json({ error: 'internal error' });
  }
}
