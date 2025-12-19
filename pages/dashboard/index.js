export async function getServerSideProps() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const listRes = await fetch(`${redisUrl}/lrange/all-slugs/0/200`, {
    headers: { Authorization: `Bearer ${redisToken}` },
  });

  const raw = (await listRes.json()).result || [];
  const uniqueSlugs = [...new Set(raw)];

  const slugs = [];

  for (const slug of uniqueSlugs) {
    const res = await fetch(`${redisUrl}/get/slug-${slug}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
    });

    const data = await res.json();
    if (data?.result) {
      slugs.push({
        slug,
        ...JSON.parse(data.result),
      });
    }
  }

  return { props: { slugs } };
}

export default function Dashboard({ slugs }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>

      {slugs.length === 0 && <p>Nog geen links.</p>}

      {slugs.map((s) => (
        <div key={s.slug} style={{ marginBottom: '1rem' }}>
          <a href={`/dashboard/${s.slug}`}>
            <strong>{s.slug}</strong>
          </a>
          <div>Flow: {s.flow}</div>
          <div>
            Eerste klik:{' '}
            {s.firstClick
              ? new Date(s.firstClick).toLocaleString()
              : 'nog niet'}
          </div>
        </div>
      ))}
    </div>
  );
}
