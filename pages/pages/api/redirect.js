
import redirects from '../../redirects.json';

export default function handler(req, res) {
  const { slug } = req.query;

  if (!slug || !redirects[slug]) {
    return res.redirect(307, 'https://beltegoed.nl/bol-com-cadeaukaart');
  }

  const { target, created } = redirects[slug];
  const createdAt = new Date(created);
  const now = new Date();
  const diffMs = now - createdAt;
  const diffMin = diffMs / 1000 / 60;

  if (diffMin > 7) {
    return res.redirect(307, 'https://beltegoed.nl/bol-com-cadeaukaart');
  }

  return res.redirect(307, target);
}
