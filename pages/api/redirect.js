
import redis from '../../lib/redis';

export default async function handler(req, res) {
  const { slug } = req.query;
  const key = `redirect:${slug}`;
  const data = await redis.get(key);

  if (!data) {
    return res.redirect('/e');
  }

  const parsed = JSON.parse(data);
  const now = Date.now();
  const validFor = 7 * 60 * 1000;

  if (now - parsed.createdAt > validFor) {
    return res.redirect('/e');
  }

  return res.redirect(parsed.target);
}
