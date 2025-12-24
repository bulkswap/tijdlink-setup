export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { password } = req.body;

  if (password !== '2026') {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // 🔐 server-side cookie (werkt 100%)
  res.setHeader('Set-Cookie', [
    'dashboard_auth=ok; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax',
  ]);

  return res.status(200).json({ ok: true });
}
