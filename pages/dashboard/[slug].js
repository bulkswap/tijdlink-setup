export async function getServerSideProps(context) {
  const { slug } = context.params;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Alle keys ophalen
  const keysRes = await fetch(`${redisUrl}/keys/log-${slug}-*`, {
    headers: { Authorization: `Bearer ${redisToken}` },
  });

  const keysData = await keysRes.json();
  const keys = keysData?.result || [];

  let logs = [];

  for (const key of keys) {
    const res = await fetch(`${redisUrl}/get/${key}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
    });
    const data = await res.json();
    if (data?.result) {
      try {
        logs.push(JSON.parse(data.result));
      } catch {}
    }
  }

  // Nieuwste eerst
  logs.sort((a, b) => b.time - a.time);

  return {
    props: {
      slug,
      logs,
    },
  };
}

export default function Dashboard({ slug, logs }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard – {slug}</h1>

      <p>Totaal aantal bezoeken: <strong>{logs.length}</strong></p>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Tijd</th>
            <th>IP</th>
            <th>Land</th>
            <th>Regio</th>
            <th>Stad</th>
            <th>User Agent</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{new Date(log.time).toLocaleString()}</td>
              <td>{log.ip}</td>
              <td>{log.country || '-'}</td>
              <td>{log.region || '-'}</td>
              <td>{log.city || '-'}</td>
              <td style={{ fontSize: '0.8rem' }}>{log.userAgent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
