import redis from '../../lib/redis';

export async function getServerSideProps({ params }) {
  const { user } = params;

  const ids = await redis.zrange(`conversions:user:${user}`, 0, -1, { rev: true });
  const rows = [];

  let commission = 0;
  let bonus = 0;

  for (const id of ids || []) {
    const c = await redis.get(id);
    if (!c) continue;

    commission += c.commission;
    bonus += c.bonus;
    rows.push(c);
  }

  return {
    props: {
      user,
      rows,
      commission: commission.toFixed(2),
      bonus: bonus.toFixed(2),
    },
  };
}

export default function UserDashboard({ user, rows, commission, bonus }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard – {user}</h1>

      <p>
        💰 Commissie: €{commission}<br />
        🎁 Bonus: €{bonus}
      </p>

      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Tijd</th>
            <th>Slug</th>
            <th>Bedrag</th>
            <th>Commissie</th>
            <th>Bonus</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{new Date(r.time).toLocaleString()}</td>
              <td>{r.slug}</td>
              <td>€{r.amount}</td>
              <td>€{r.commission}</td>
              <td>€{r.bonus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
