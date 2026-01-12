import redis from '../../lib/redis';
import Link from 'next/link';

const PER_PAGE = 25;
const MAX_SCAN_SUBUSER = 200; // 🔥 performance fix

export async function getServerSideProps({ query, req }) {
  /* 🔐 AUTH */
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/dashboard_auth=([^;]+)/);
  const user = match?.[1];

  if (!user) {
    return {
      redirect: {
        destination: '/dashboard-login',
        permanent: false,
      },
    };
  }

  const isAdmin = user === 'admin';

  const page = parseInt(query.page || '1', 10);
  const search = (query.q || '').trim().toLowerCase();

  let logs = [];
  let total = 0;

  /* --------------------------------------------------
     🔎 ZOEKMODE (max 100 logs scannen)
  -------------------------------------------------- */
  if (search) {
    const ids = await redis.zrange('logs:index', 0, 99, { rev: true });

    for (const id of ids || []) {
      const data = await redis.get(id);
      if (!data) continue;

      if (
        data.slug?.toLowerCase().includes(search) &&
        (isAdmin || data.source === user)
      ) {
        logs.push(data);
      }
    }

    total = logs.length;
  } else {
    /* --------------------------------------------------
       📄 NORMALE PAGINATIE
    -------------------------------------------------- */
    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE - 1;

    const ids = await redis.zrange('logs:index', start, end, { rev: true });

    for (const id of ids || []) {
      const data = await redis.get(id);
      if (!data) continue;

      if (isAdmin || data.source === user) {
        logs.push(data);
      }
    }

    if (isAdmin) {
      total = await redis.zcard('logs:index');
    } else {
      // ⚡ PERFORMANCE FIX: scan max 200 logs
      const all = await redis.zrange(
        'logs:index',
        0,
        MAX_SCAN_SUBUSER - 1,
        { rev: true }
      );

      let count = 0;
      for (const id of all || []) {
        const d = await redis.get(id);
        if (d?.source === user) count++;
      }

      total = count;
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return {
    props: {
      logs,
      page,
      totalPages,
      total,
      search,
      user,
      isAdmin,
    },
  };
}

export default function Dashboard({
  logs,
  page,
  totalPages,
  total,
  search,
  user,
  isAdmin,
}) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>
        Dashboard – {isAdmin ? 'Admin' : user}
      </h1>

      {/* 🔎 ZOEKEN */}
      <form method="GET" style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          name="q"
          placeholder="Zoek op slug…"
          defaultValue={search}
          style={{ padding: '0.5rem', width: 260 }}
        />
        <button style={{ marginLeft: '0.5rem' }}>Zoeken</button>

        {search && (
          <a href="/dashboard" style={{ marginLeft: '1rem' }}>
            reset
          </a>
        )}
      </form>

      <p>
        Totaal <strong>{total}</strong> kliks
        {!search && (
          <>
            {' '}
            · Pagina <strong>{page}</strong> van{' '}
            <strong>{totalPages}</strong>
          </>
        )}
      </p>

      {logs.length === 0 && <p>Geen resultaten.</p>}

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
            <th>Pay</th>
            <th>IP</th>
            <th>Locatie</th>
            <th>Status</th>
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

              <td>
                {log.lat && log.lng ? (
                  <a
                    href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📍 kaart
                  </a>
                ) : (
                  '—'
                )}
              </td>

              <td>
                {log.locationStatus === 'allowed' && '✅ toegestaan'}
                {log.locationStatus === 'denied' && '❌ geweigerd'}
                {!log.locationStatus && '—'}
              </td>

              <td
                style={{
                  maxWidth: 320,
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

      {!search && (
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
      )}
    </div>
  );
}
