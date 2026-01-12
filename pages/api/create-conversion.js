import redis from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const {
    slug,
    phone,
    amount,
    category, // chat | cam | bundel
    notes = '',
  } = req.body;

  // 🔒 Validatie
  if (!slug || !phone || !amount || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const now = Date.now();

  const commissionRate = 0.25;
  const commission = Number((amount * commissionRate).toFixed(2));
  const bonus = 2.5;

  const id = `conversion-${slug}-${now}`;

  const conversion = {
    id,
    slug,
    phone,
    amount,
    category,
    notes,
    commission,
    bonus,
    paid: false,
    time: now,
  };

  /* 🔥 OPSLAAN */
  await redis.set(id, conversion);

  /* 🔥 INDEX VOOR OVERZICHTEN */
  await redis.zadd('conversions:index', {
    score: now,
    member: id,
  });

  /* 🔥 INDEX PER SLUG */
  await redis.zadd(`conversions:slug:${slug}`, {
    score: now,
    member: id,
  });

  return res.status(200).json({ ok: true });
}
