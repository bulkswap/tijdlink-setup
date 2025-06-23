import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export default function handler(req, res) {
  const dbPath = path.join(process.cwd(), 'redirects.json');
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  let slug;
  do {
    slug = nanoid(10);
  } while (data[slug]);

  data[slug] = {
    target: "https://tikkie.me/pay/v5e4jnd2iqbhe7o53k0n"
  };

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  res.status(200).json({ slug });
}
