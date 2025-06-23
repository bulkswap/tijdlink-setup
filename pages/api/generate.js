import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export default function handler(req, res) {
  const dbPath = path.join(process.cwd(), 'redirects.json');
  const data = fs.existsSync(dbPath)
    ? JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    : {};

  let slug;
  do {
    slug = nanoid(10);
  } while (data[slug]);

  const now = Date.now();

  data[slug] = {
    target: "https://tikkie.me/pay/v5e4jnd2iqbhe7o53k0n",
    createdAt: now,
    firstClick: null
  };

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  res.status(200).json({ slug });
}
