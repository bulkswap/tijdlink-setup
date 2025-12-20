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
    },
  };
}

export default function SlugDetail({ slug, logs }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Details voor slug: {slug}</h1>

      <p>
        <a href={`/pay/${slug}`} target="_blank">
          👉 Open pay link
        </a>
      </p>

      {logs.length === 0 && <p>Geen kliks voor deze slug.</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Tijd</th>
            <th>Flow</th>
            <th>Event</th>
            <th>IP</th>
            <th>Locatie</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{new Date(log.time).toLocaleString()}</td>
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
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
