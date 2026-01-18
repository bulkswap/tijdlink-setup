// pages/api/generate.js
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
    target: "https://tikkie.me/verlopen/",
    firstClick: null,
  });

  res.status(200).json({ slug: `pay/${slug}` });
}
