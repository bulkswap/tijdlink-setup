import redis from '../../lib/redis';
import Link from 'next/link';

export async function getServerSideProps({ params, req }) {
  const cookie = req.headers.cookie || '';

  // 🔐 Dashboard beveiliging
  if (!cookie.includes('dashboard_auth=ok')) {
    return {
      redirect: {
        destination: '/dashboard-login',
        permanent: false,
      },
    };
  }

  const { slug } = params;

  // 🔍 haal alle logs voor deze slug op
  const keys = await redis.keys(`log-${slug}-*`);
  const logs = [];

  for (const key of keys || []) {
    const data = await redis.get(key);
    if (data) logs.push(data);
  }

  // nieuwste bovenaan
  logs.sort((a, b) => b.time - a.time);

  return {
    props: {
      slug,
      logs,
    },
  };
}

export default function DashboardSlug({ slug, logs }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard – {slug}</h1>

      <p>
        <a href={`/pay/${slug}`} target="_blank" rel="noreferrer">
          🔗 Open betaal-link
        </a>
      </p>

      <p>
        <Link href="/dashboard">← Terug naar overzicht</Link>
      </p>

      {logs.length === 0 && <p>Nog geen kliks voor deze link.</p>}

      {logs.length > 0 && (
        <table
          border="1"
          cellPadding="8"
          style={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th>Tijd</th>
              <th>Flow</th>
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

                <td>{log.flow || '—'}</td>

                <td>{log.event || '—'}</td>

                <td>{log.ip || '—'}</td>

                <td>
                  {log.lat && log.lng ? (
                    <a
                      href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📍 Bekijk kaart
                    </a>
                  ) : (
                    '—'
                  )}
                </td>

                <td
                  style={{
                    maxWidth: 400,
                    wordBreak: 'break-all',
                    fontSize: '0.85rem',
                  }}
                >
                  {log.userAgent || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
