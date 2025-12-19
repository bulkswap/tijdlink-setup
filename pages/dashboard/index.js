export async function getServerSideProps() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const keysRes = await fetch(`${redisUrl}/keys/slug-*`, {
    headers: { Authorization: `Bearer ${redisToken}` },
  });

  const keys = (await keysRes.json()).result || [];
  const slugs = [];

  for (const key of keys) {
    const res = await fetch(`${redisUrl}/get/${key}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
    });
    const val = await res.json();
    if (val?.result) {
      slugs.push({
        slug: key.replace('slug-', ''),
        ...JSON.parse(val.result),
      });
    }
  }

  return { props: { slugs } };
}

export default function Dashboard({ slugs }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>

      {slugs.map((s) => (
        <div key={s.slug} style={{ marginBottom: '1rem' }}>
          <a href={`/dashboard/${s.slug}`}>
            <strong>{s.slug}</strong>
          </a>
          <br />
          Flow: {s.flow}
        </div>
      ))}
    </div>
  );
}
