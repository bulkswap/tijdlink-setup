import redis from '../../lib/redis';
import Link from 'next/link';

export async function getServerSideProps() {
  const keys = await redis.keys('log-*');
  const logs = [];

  for (const key of keys || []) {
    const data = await redis.get(key);
    if (data) logs.push(data);
  }

  logs.sort((a, b) => b.time - a.time);

  return { props: { logs } };
}

export default function Dashboard({ logs }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard – Alle kliks</h1>

      {logs.length === 0 && <p>Nog geen kliks.</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Tijd</th>
            <th>Slug</th>
            <th>Flow</th>
            <th>Event</th>
            <th>Pay link</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{new Date(log.time).toLocaleString()}</td>

              <td>
                <Link href={`/dashboard/${log.slug}`}>
                  {log.slug}
                </Link>
              </td>

              <td>{log.flow}</td>
              <td>{log.event}</td>

              <td>
                <a href={`/pay/${log.slug}`} target="_blank">
                  /pay/{log.slug}
                </a>
              </td>

              <td>{log.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
