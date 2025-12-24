export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const password = req.body?.password;

  if (password !== '2026') {
    return res.status(401).send('Verkeerd wachtwoord');
  }

  // 🔐 COOKIE ZETTEN (server-side, altijd zichtbaar)
  res.setHeader('Set-Cookie', [
    'dashboard_auth=ok; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax',
  ]);

  // 👉 DIRECT REDIRECT NA LOGIN
  res.writeHead(302, { Location: '/dashboard' });
  res.end();
}
