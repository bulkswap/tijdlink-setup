import redis from '../../lib/redis';
import { isAdmin } from '../../lib/auth';

export async function getServerSideProps({ req }) {
  if (!isAdmin(req)) return { redirect: { destination: '/dashboard-login', permanent: false } };

  const ids = await redis.zrange('payouts:index', 0, -1, { rev: true });
  const payouts = [];

  for (const id of ids) {
    const p = await redis.get(id);
    if (p) payouts.push(p);
  }

  return { props: { payouts } };
}

export default function Payouts({ payouts }) {
  return (
    <div style={{ padding: 32 }}>
      <h1>Uitbetalingen</h1>

      {payouts.map(p => (
        <div key={p.id} style={{ marginBottom: 12 }}>
          <b>{p.user}</b> – {p.type} – €{p.amount} – {p.status}
          {p.status === 'pending' && (
            <button onClick={() => fetch('/api/payout/mark-paid', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: p.id })
            })}>
              Markeer als betaald
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
