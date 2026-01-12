import redis from '../../lib/redis';
import Link from 'next/link';

export async function getServerSideProps({ params, req }) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/dashboard_auth=([^;]+)/);
  const user = match?.[1];

  if (!user) {
    return {
      redirect: {
        destination: '/dashboard-login',
        permanent: false,
      },
    };
  }

  const { slug } = params;

  const keys = await redis.keys(`log-${slug}-*`);
  const logs = [];

  for (const key of keys || []) {
    const data = await redis.get(key);
    if (!data) continue;

    // 🔒 sub-user mag alleen eigen source zien
    if (user !== 'admin' && data.source !== user) continue;

    logs.push(data);
  }

  logs.sort((a, b) => b.time - a.time);

  return {
    props: {
      slug,
      logs,
      user,
    },
  };
}

export default function DashboardSlug({ slug, logs, user }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard – {slug}</h1>

      <p>
        <strong>Ingelogd als:</strong> {user}
      </p>

      <p>
        <a href={`/pay/${slug}`} target="_blank" rel="noreferrer">
          🔗 Open betaal-link
        </a>
      </p>

      <p>
        <Link href="/dashboard">← Terug naar overzicht</Link>
      </p>

      {logs.length === 0 && <p>Geen logs.</p>}

      {logs.length > 0 && (
        <table border="1" cellPadding="8" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Tijd</th>
              <th>Event</th>
              <th>IP</th>
              <th>Locatie</th>
              <th>User Agent</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td>{new Date(log.time).toLocaleString()}</td>
                <td>{log.event}</td>
                <td>{log.ip}</td>
                <td>
                  {log.lat && log.lng ? (
                    <a
                      href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📍
                    </a>
                  ) : '—'}
                </td>
                <td style={{ maxWidth: 300, wordBreak: 'break-all' }}>
                  {log.userAgent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
