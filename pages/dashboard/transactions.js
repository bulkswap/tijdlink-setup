import redis from '../../lib/redis';

export async function getServerSideProps({ req }) {
  if (!req.headers.cookie?.includes('dashboard_auth=ok')) {
    return { redirect: { destination: '/dashboard-login', permanent: false } };
  }

  const ids = await redis.zrange('conversions:index', 0, -1, { rev: true });
  const rows = [];

  let totalCommission = 0;
  let totalBonus = 0;

  for (const id of ids || []) {
    const c = await redis.get(id);
    if (!c) continue;

    totalCommission += c.commission;
    totalBonus += c.bonus;

    rows.push(c);
  }

  return {
    props: {
      rows,
      totalCommission: totalCommission.toFixed(2),
      totalBonus: totalBonus.toFixed(2),
    },
  };
}

export default function Transactions({ rows, totalCommission, totalBonus }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Transacties</h1>

      <p>
        💰 Commissie saldo: <strong>€{totalCommission}</strong><br />
        🎁 Bonus saldo: <strong>€{totalBonus}</strong>
      </p>

      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Tijd</th>
            <th>User</th>
            <th>Slug</th>
            <th>Telefoon</th>
            <th>Categorie</th>
            <th>Bedrag</th>
            <th>Commissie</th>
            <th>Bonus</th>
            <th>Uitbetaald</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{new Date(r.time).toLocaleString()}</td>
              <td>{r.user}</td>
              <td>{r.slug}</td>
              <td>{r.phone}</td>
              <td>{r.category}</td>
              <td>€{r.amount}</td>
              <td>€{r.commission}</td>
              <td>€{r.bonus}</td>
              <td>{r.paid ? '✅' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
