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
          <div><strong>IP:</strong> {log.ip}</div>
          <div><strong>User-Agent:</strong> {log.userAgent}</div>
          <div><strong>Lat:</strong> {log.lat}</div>
          <div><strong>Lng:</strong> {log.lng}</div>
        </div>
      ))}
    </div>
  );
}
