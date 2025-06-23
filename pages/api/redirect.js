// /pages/api/redirect.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { slug } = req.query;
  const dbPath = path.join(process.cwd(), 'redirects.json');
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const entry = data[slug];
  if (!entry) return res.redirect('/e');

  const now = Date.now();

  if (!entry.firstClick) {
    entry.firstClick = now;
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return res.redirect(entry.target);
  }

  const diff = now - entry.firstClick;
  if (diff < 7 * 60 * 1000) {
    return res.redirect(entry.target);
  } else {
    return res.redirect('/e');
  }
}
