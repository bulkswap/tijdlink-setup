
import { nanoid } from 'nanoid';
import redis from '../../lib/redis';

export default async function handler(req, res) {
  const slug = nanoid(10);
  const key = `redirect:${slug}`;
  const value = JSON.stringify({
    target: "https://tikkie.me/pay/v5e4jnd2iqbhe7o53k0n",
    createdAt: Date.now()
  });
  await redis.set(key, value);
  res.status(200).json({ slug });
}
