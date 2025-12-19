import redis from '../../lib/redis';

export async function getServerSideProps({ req, res }) {
  const auth = req.headers.authorization;
  const PASSWORD = '2026';

  if (!auth) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard"');
    res.end('Auth required');
    return { props: {} };
  }

  const [, base64] = auth.split(' ');
  const [, enteredPassword] = Buffer.from(base64, 'base64')
    .toString()
    .split(':');

  if (enteredPassword !== PASSWORD) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard"');
    res.end('Wrong password');
    return { props: {} };
  }

  // 🔹 Logs ophalen
  const keys = await redis.keys('log-*');
  const logs = [];

  for (const key of keys || []) {
    const data = await redis.get(key);
    if (data) logs.push(data);
  }

  logs.sort((a, b) => b.time - a.time);

  return { props: { logs } };
}

export default function Dashboard({ logs = [] }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard – Kliklog</h1>

      {logs.length === 0 && <p>Nog geen kliks.</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Tijd</th>
            <th>Slug</th>
            <th>IP</th>
            <th>Locatie</th>
            <th>User Agent</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{new Date(log.time).toLocaleString()}</td>
              <td>
                <a href={`/dashboard/${log.slug}`} target="_blank">
                  {log.slug}
                </a>
              </td>
              <td>{log.ip}</td>
              <td>
                {log.lat && log.lng ? (
                  <a
                    href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📍 Google Maps
                  </a>
                ) : '—'}
              </td>
              <td title={log.userAgent}>
                {log.userAgent?.slice(0, 40)}…
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
