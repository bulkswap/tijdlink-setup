import redis from '../../lib/redis';

export async function getServerSideProps({ params }) {
  const { slug } = params;

  const keys = await redis.keys(`log-${slug}-*`);
  const logs = [];

  for (const key of keys || []) {
    const data = await redis.get(key);
    if (data) logs.push(data);
  }

  logs.sort((a, b) => b.time - a.time);

  return {
    props: {
      slug,
      logs,
      count: logs.length,
    },
  };
}

export default function SlugDetail({ slug, logs, count }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Slug: {slug}</h1>
      <p><strong>Aantal bezoeken:</strong> {count}</p>

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Tijd</th>
            <th>IP</th>
            <th>Locatie</th>
            <th>User Agent</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{new Date(log.time).toLocaleString()}</td>
              <td>{log.ip}</td>
              <td>
                {log.lat && log.lng ? (
                  <a
                    href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📍 Open in Google Maps
                  </a>
                ) : '—'}
              </td>
              <td title={log.userAgent}>
                {log.userAgent?.slice(0, 50)}…
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
