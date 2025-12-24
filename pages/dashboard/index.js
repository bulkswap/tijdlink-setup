import redis from '../../lib/redis';
import Link from 'next/link';

const PER_PAGE = 25;

export async function getServerSideProps({ query }) {
  const page = parseInt(query.page || '1', 10);

  const keys = await redis.keys('log-*');
  const logs = [];

  for (const key of keys || []) {
    const data = await redis.get(key);
    if (data) logs.push(data);
  }

  // Nieuwste eerst
  logs.sort((a, b) => b.time - a.time);

  const total = logs.length;
  const totalPages = Math.ceil(total / PER_PAGE);

  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE;

  const pageLogs = logs.slice(start, end);

  return {
    props: {
      logs: pageLogs,
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
        Totaal: <strong>{total}</strong> kliks · Pagina{' '}
        <strong>{page}</strong> van <strong>{totalPages}</strong>
      </p>

      {logs.length === 0 && <p>Geen kliks op deze pagina.</p>}

      <table
        border="1"
        cellPadding="8"
        style={{ width: '100%', borderCollapse: 'collapse' }}
      >
        <thead>
          <tr>
            <th>Tijd</th>
            <th>Slug</th>
            <th>Flow</th>
            <th>Event</th>
            <th>Pay link</th>
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

              <td>{log.flow || '—'}</td>
              <td>{log.event || '—'}</td>

              <td>
                <a
                  href={`/pay/${log.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  /pay/{log.slug}
                </a>
              </td>

              <td>{log.ip || '—'}</td>

              <td
                style={{
                  maxWidth: 280,
                  wordBreak: 'break-all',
                  fontSize: '0.85rem',
                }}
              >
                {log.userAgent || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        {page > 1 && (
          <Link href={`/dashboard?page=${page - 1}`}>
            ← Vorige
          </Link>
        )}

        {page < totalPages && (
          <Link href={`/dashboard?page=${page + 1}`}>
            Volgende →
          </Link>
        )}
      </div>
    </div>
  );
}
