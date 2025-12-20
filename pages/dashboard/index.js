import redis from '../../lib/redis';

export async function getServerSideProps({ query }) {
  // 🔐 simpele password check
  if (query.p !== '2026') {
    return {
      redirect: {
        destination: '/dashboard-login',
        permanent: false,
      },
    };
  }

  const keys = await redis.keys('log-*');
  const logs = [];

  for (const key of keys || []) {
    const data = await redis.get(key);
    if (data) logs.push(data);
  }

  logs.sort((a, b) => b.time - a.time);

  return { props: { logs } };
}

export default function Dashboard({ logs }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard – Kliklog</h1>

      {logs.length === 0 && <p>Nog geen kliks.</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Tijd</th>
            <th>Slug</th>
            <th>Pay link</th>
            <th>Flow</th>
            <th>Event</th>
            <th>IP</th>
            <th>Locatie</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{new Date(log.time).toLocaleString()}</td>
              <td>{log.slug}</td>
              <td>
                <a href={`/pay/${log.slug}`} target="_blank">/pay/{log.slug}</a>
              </td>
              <td>{log.flow}</td>
              <td>{log.event}</td>
              <td>{log.ip}</td>
              <td>
                {log.lat && log.lng ? (
                  <a
                    href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                    target="_blank"
                  >
                    📍 kaart
                  </a>
                ) : '—'}
              </td>
              <td>
                {log.event === 'expired-hit'
                  ? '⏱️ Verlopen'
                  : log.locationStatus === 'denied'
                  ? '❌ Geweigerd'
                  : log.locationStatus === 'allowed'
                  ? '✅ Toegestaan'
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
