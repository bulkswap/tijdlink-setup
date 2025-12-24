import redis from '../../lib/redis';

export default async function handler(req, res) {
  // 🔐 simpele beveiliging (optioneel)
  if (req.query.key !== 'migrate-2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const keys = await redis.keys('log-*');

  let added = 0;
  let skipped = 0;

  for (const key of keys) {
    const data = await redis.get(key);
    if (!data || !data.time) {
      skipped++;
      continue;
    }

    // check of hij al in de index zit
    const exists = await redis.zscore('logs:index', key);
    if (exists !== null) {
      skipped++;
      continue;
    }

    // voeg toe aan index
    await redis.zadd('logs:index', {
      score: data.time,
      member: key,
    });

    added++;
  }

  res.status(200).json({
    totalFound: keys.length,
    added,
    skipped,
  });
}
