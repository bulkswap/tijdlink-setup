import redis from '../../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).end();

  const payout = await redis.get(id);
  if (!payout) return res.status(404).end();

  payout.status = 'paid';
  payout.paidAt = Date.now();

  await redis.set(id, payout);

  res.json({ ok: true });
}
