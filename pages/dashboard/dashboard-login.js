export const config = {
  api: {
    bodyParser: false, // 👈 belangrijk
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  // 🔥 RAW BODY LEZEN
  let body = '';
  await new Promise((resolve) => {
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', resolve);
  });

  // body = "password=2026"
  const params = new URLSearchParams(body);
  const password = params.get('password');

  if (password !== '2026') {
    res.status(401).send('Verkeerd wachtwoord');
    return;
  }

  // 🍪 COOKIE ZETTEN (server-side)
  res.setHeader('Set-Cookie', [
    'dashboard_auth=ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400',
  ]);

  // ➜ redirect naar dashboard
  res.writeHead(302, { Location: '/dashboard' });
  res.end();
}
