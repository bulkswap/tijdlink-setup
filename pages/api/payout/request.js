import redis from '../../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { user, type } = req.body; // commission | bonus
  if (!user || !type) return res.status(400).end();

  const balanceKey = `balance:${user}`;
  const balance = (await redis.get(balanceKey)) || { commission: 0, bonus: 0 };

  const amount = balance[type];
  if (amount < 100) {
    return res.status(400).json({ error: 'Minimum is €100' });
  }

  const now = Date.now();
  const id = `payout-${user}-${now}`;

  const payout = {
    id,
    user,
    type,
    amount,
    status: 'pending',
    requestedAt: now,
    paidAt: null,
  };

  await redis.set(id, payout);
  await redis.zadd('payouts:index', { score: now, member: id });
  await redis.zadd(`payouts:user:${user}`, { score: now, member: id });

  // saldo reset
  balance[type] = 0;
  await redis.set(balanceKey, balance);

  res.json({ ok: true });
}
