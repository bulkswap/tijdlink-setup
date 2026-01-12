import { nanoid } from 'nanoid';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  let slug;

  do {
    slug = nanoid(13);
  } while (await redis.get(`slug-${slug}`));

  await redis.set(`slug-${slug}`, {
    target: 'https://tikkie.me/pay/q07e26r6qvefemb5ump6',

    // 🔑 bestaande flow (blijft werken)
    flow: 'normal',
    firstClick: null,

    // 🆕 NIEUW (voor dashboard & filtering)
    source: 'fleur',          // wie heeft deze link aangemaakt
    dashboardUser: 'fleur',   // login-naam
    dashboardPin: '4821',     // 4-cijferige pincode (verzinbaar)
  });

  // ⬅️ BELANGRIJK: exact hetzelfde response-format laten
  res.status(200).json({
    slug: `pay/${slug}`,
  });
}
