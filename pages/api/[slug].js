import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { slug } = req.query;
  const dbPath = path.join(process.cwd(), 'redirects.json');

  // Check of redirects.json bestaat
  if (!fs.existsSync(dbPath)) return res.redirect('/e');

  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const entry = data[slug];

  // Slug niet gevonden
  if (!entry) return res.redirect('/e');

  const now = Date.now();

  // Eerste klik: start timer
  if (!entry.firstClick) {
    entry.firstClick = now;
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return res.redirect(entry.target);
  }

  // Bepaal of 7 minuten verstreken zijn
  const diff = now - entry.firstClick;
  const validFor = 7 * 60 * 1000; // = 420.000 ms

  if (diff < validFor) {
    return res.redirect(entry.target);
  } else {
    return res.redirect('/e');
  }
}
