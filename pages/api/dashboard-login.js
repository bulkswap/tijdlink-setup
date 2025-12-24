export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  let body = '';
  await new Promise((resolve) => {
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', resolve);
  });

  const params = new URLSearchParams(body);
  const password = params.get('password');

  if (password !== '2026') {
    res.status(401).send('Verkeerd wachtwoord');
    return;
  }

  res.setHeader(
    'Set-Cookie',
    'dashboard_auth=ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400'
  );

  res.writeHead(302, { Location: '/dashboard' });
  res.end();
}
