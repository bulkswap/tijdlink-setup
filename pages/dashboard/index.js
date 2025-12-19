import redis from '../../lib/redis';

export async function getServerSideProps() {
  const raw = await redis.lrange('all-slugs', 0, 200);
  const uniqueSlugs = [...new Set(raw || [])];

  const slugs = [];

  for (const slug of uniqueSlugs) {
    const data = await redis.get(`slug-${slug}`);
    if (data) {
      slugs.push({
        slug,
        ...data,
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
