import redis from '../../lib/redis';
import Link from 'next/link';

const PER_PAGE = 25;

export async function getServerSideProps({ query, req }) {
  // 🔐 AUTH CHECK
  const cookie = req.headers.cookie || '';
  if (!cookie.includes('dashboard_auth=ok')) {
    return {
      redirect: {
        destination: '/dashboard-login',
        permanent: false,
      },
    };
  }

  const page = parseInt(query.page || '1', 10);
  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE - 1;

  const ids = await redis.zrange('logs:index', start, end, { rev: true });

  const logs = [];
  for (const id of ids || []) {
    const data = await redis.get(id);
    if (data) logs.push(data);
  }

  const total = await redis.zcard('logs:index');
  const totalPages = Math.ceil(total / PER_PAGE);

  return {
    props: {
      logs,
      page,
      totalPages,
      total,
    },
  };
}

export default function Dashboard({ logs, page, totalPages, total }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard – Kliklog</h1>

      <p>
        Totaal <strong>{total}</strong> kliks · Pagina{' '}
        <strong>{page}</strong> van <strong>{totalPages}</strong>
      </p>

      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Tijd</th>
            <th>Slug</th>
            <th>Flow</th>
            <th>Event</th>
            <th>IP</th>
            <th>User Agent</th>
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
              <td>{log.ip}</td>
              <td style={{ maxWidth: 300, wordBreak: 'break-all' }}>
                {log.userAgent}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '1rem' }}>
        {page > 1 && <Link href={`/dashboard?page=${page - 1}`}>← Vorige</Link>}
        {' '}
        {page < totalPages && <Link href={`/dashboard?page=${page + 1}`}>Volgende →</Link>}
      </div>
    </div>
  );
}
