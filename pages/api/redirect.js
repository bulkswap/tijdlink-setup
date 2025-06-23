
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { slug } = req.query;
  const filePath = path.join(process.cwd(), 'redirects.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const entry = data[slug];
  if (!entry) return res.redirect('/expired.html');

  const now = Date.now();

  if (!entry.firstClick) {
    entry.firstClick = now;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return res.redirect(entry.target);
  }

  const elapsed = now - entry.firstClick;
  if (elapsed < 60 * 60 * 1000) {
    return res.redirect(entry.target);
  } else {
    return res.redirect('/expired.html');
  }
}
