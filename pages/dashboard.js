export async function getServerSideProps() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 🔍 haal ALLE locatie-logs op
  const keysRes = await fetch(`${redisUrl}/keys/location-*`, {
    headers: { Authorization: `Bearer ${redisToken}` },
  });

  const keys = (await keysRes.json()).result || [];

  const logs = [];

  for (const key of keys) {
    const res = await fetch(`${redisUrl}/get/${key}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
    });
    const val = await res.json();
    if (val?.result) logs.push(JSON.parse(val.result));
  }

  // nieuwste eerst
  logs.sort((a, b) => b.time - a.time);

  return { props: { logs } };
}

export default function Dashboard({ logs }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>

      {logs.length === 0 && <p>Geen logs gevonden.</p>}

      {logs.map((log, i) => (
        <div
          key={i}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <strong>Slug:</strong> {log.slug}<br />
          <strong>Lat:</strong> {log.lat}<br />
          <strong>Lng:</strong> {log.lng}<br />
          <strong>Tijd:</strong>{' '}
          {new Date(log.time).toLocaleString()}
        </div>
      ))}
    </div>
  );
}
