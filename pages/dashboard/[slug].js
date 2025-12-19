export async function getServerSideProps({ params }) {
  const { slug } = params;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const keysRes = await fetch(`${redisUrl}/keys/log-${slug}-*`, {
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

  logs.sort((a, b) => b.time - a.time);

  return { props: { slug, logs } };
}

export default function SlugDetail({ slug, logs }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Slug: {slug}</h1>

      {logs.map((log, i) => (
        <div
          key={i}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div><strong>Tijd:</strong> {new Date(log.time).toLocaleString()}</div>
          <div><strong>User-Agent:</strong> {log.userAgent}</div>
          <div><strong>Lat:</strong> {log.lat}</div>
          <div><strong>Lng:</strong> {log.lng}</div>
        </div>
      ))}
    </div>
  );
}
