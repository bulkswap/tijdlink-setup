import redis from '../../lib/redis';
import { isAdmin, getUserFromCookie } from '../../lib/auth';

export async function getServerSideProps({ req }) {
  const admin = isAdmin(req);
  const user = admin ? null : getUserFromCookie(req);
  if (!admin && !user) return { redirect: { destination: '/dashboard-login', permanent: false } };

  const key = admin ? 'conversions:index' : `conversions:user:${user}`;
  const ids = await redis.zrange(key, 0, -1, { rev: true });

  const conversions = [];
  for (const id of ids) {
    const c = await redis.get(id);
    if (c) conversions.push(c);
  }

  return { props: { conversions, admin } };
}

export default function Conversions({ conversions, admin }) {
  return (
    <div style={{ padding: 32 }}>
      <h1>Conversies</h1>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Tijd</th>
            <th>User</th>
            <th>Slug</th>
            <th>Telefoon</th>
            <th>Bedrag</th>
            <th>Commissie</th>
            <th>Bonus</th>
            {admin && <th>Acties</th>}
          </tr>
        </thead>
        <tbody>
          {conversions.map(c => (
            <tr key={c.id}>
              <td>{new Date(c.time).toLocaleString()}</td>
              <td>{c.user}</td>
              <td>{c.slug}</td>
              <td>{c.phone}</td>
              <td>€{c.amount}</td>
              <td>€{c.commission}</td>
              <td>€{c.bonus}</td>
              {admin && (
                <td>
                  <button onClick={() => fetch('/api/conversion/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: c.id, user: c.user })
                  })}>
                    Verwijder
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
