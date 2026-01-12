import redis from '../../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id, user } = req.body;
  if (!id || !user) return res.status(400).end();

  const conv = await redis.get(id);
  if (!conv) return res.status(404).end();

  await redis.del(id);
  await redis.zrem('conversions:index', id);
  await redis.zrem(`conversions:user:${user}`, id);

  // saldo corrigeren
  const balanceKey = `balance:${user}`;
  const balance = (await redis.get(balanceKey)) || { commission: 0, bonus: 0 };

  balance.commission -= conv.commission;
  balance.bonus -= conv.bonus;

  await redis.set(balanceKey, balance);

  res.json({ ok: true });
}
