import redis from '../../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    slug,
    user,
    phone,
    amount,
    category,
    notes = '',
  } = req.body;

  if (!slug || !user || !phone || !amount || !category) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const now = Date.now();
  const commission = Number((amount * 0.25).toFixed(2));
  const bonus = 2.5;

  const id = `conversion-${slug}-${now}`;

  const data = {
    id,
    slug,
    user,
    phone,
    amount,
    category,
    notes,
    commission,
    bonus,
    time: now,
  };

  await redis.set(id, data);
  await redis.zadd('conversions:index', { score: now, member: id });
  await redis.zadd(`conversions:user:${user}`, { score: now, member: id });

  // saldo verhogen
  const balanceKey = `balance:${user}`;
  const balance = (await redis.get(balanceKey)) || { commission: 0, bonus: 0 };

  balance.commission += commission;
  balance.bonus += bonus;

  await redis.set(balanceKey, balance);

  res.json({ ok: true });
}
