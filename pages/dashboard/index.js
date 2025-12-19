export async function getServerSideProps() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Alle log-keys ophalen
  const keysRes = await fetch(`${redisUrl}/keys/log-*`, {
    headers: { Authorization: `Bearer ${redisToken}` },
  });

  const keysData = await keysRes.json();
  const keys = keysData?.result || [];

  const perSlug = {};

  for (const key of keys) {
    const res = await fetch(`${redisUrl}/get/${key}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
    });

    const data = await res.json();
    if (!data?.result) continue;

    let log;
    try {
      log = JSON.parse(data.result);
    } catch {
      continue;
    }

    if (!perSlug[log.slug]) {
      perSlug[log.slug] = {
        slug: log.slug,
        count: 0,
        first: log.time,
        last: log.time,
      };
    }

    perSlug[log.slug].count++;
    perSlug[log.slug].first = Math.min(perSlug[log.slug].first, log.time);
    perSlug[log.slug].last = Math.max(perSlug[log.slug].last, log.time);
  }

  const slugs = Object.values(perSlug).sort(
    (a, b) => b.last - a.last
  );

  return {
    props: { slugs },
  };
}

export default function DashboardAll({ slugs }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard – alle slugs</h1>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Slug</th>
            <th>Clicks</th>
            <th>Eerste klik</th>
            <th>Laatste klik</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {slugs.map((s) => (
            <tr key={s.slug}>
              <td>{s.slug}</td>
              <td>{s.count}</td>
              <td>{new Date(s.first).toLocaleString()}</td>
              <td>{new Date(s.last).toLocaleString()}</td>
              <td>
                <a href={`/dashboard/${s.slug}`} target="_blank">
                  Bekijk
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
