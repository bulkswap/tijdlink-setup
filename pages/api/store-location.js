export default async function handler(req, res) {
  const { slug, lat, lng, accuracy } = req.body;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  await fetch(`${redisUrl}/set/location-${slug}-${Date.now()}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      slug,
      lat,
      lng,
      accuracy,
      time: Date.now(),
    }),
  });

  res.status(200).json({ ok: true });
}
