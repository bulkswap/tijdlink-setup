import { useState } from 'react';
import redis from '../../lib/redis';
import Link from 'next/link';

export async function getServerSideProps({ params, req }) {
  const cookie = req.headers.cookie || '';

  // 🔐 Dashboard beveiliging
  if (!cookie.includes('dashboard_auth=ok')) {
    return {
      redirect: {
        destination: '/dashboard-login',
        permanent: false,
      },
    };
  }

  const { slug } = params;

  // 🔍 logs ophalen
  const keys = await redis.keys(`log-${slug}-*`);
  const logs = [];

  for (const key of keys || []) {
    const data = await redis.get(key);
    if (data) logs.push(data);
  }

  logs.sort((a, b) => b.time - a.time);

  return {
    props: {
      slug,
      logs,
    },
  };
}

export default function DashboardSlug({ slug, logs }) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('chat');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const submitConversion = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!phone || !amount || !category) {
      setError('Vul alle verplichte velden in.');
      return;
    }

    const res = await fetch('/api/create-conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        phone,
        amount: Number(amount),
        category,
        notes,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setPhone('');
      setAmount('');
      setNotes('');
    } else {
      setError('Opslaan mislukt');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard – {slug}</h1>

      <p>
        <a href={`/pay/${slug}`} target="_blank" rel="noreferrer">
          🔗 Open betaal-link
        </a>
      </p>

      <p>
        <Link href="/dashboard">← Terug naar overzicht</Link>
      </p>

      {/* ================= CONVERSIE FORM ================= */}
      <hr style={{ margin: '2rem 0' }} />

      <h2>➕ Handmatige conversie</h2>

      <form onSubmit={submitConversion} style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <input
            type="text"
            placeholder="Telefoonnummer *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <input
            type="number"
            placeholder="Bedrag (€) *"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            <input
              type="radio"
              value="chat"
              checked={category === 'chat'}
              onChange={() => setCategory('chat')}
            /> Chat
          </label>{' '}
          <label>
            <input
              type="radio"
              value="cam"
              checked={category === 'cam'}
              onChange={() => setCategory('cam')}
            /> Cam
          </label>{' '}
          <label>
            <input
              type="radio"
              value="bundel"
              checked={category === 'bundel'}
              onChange={() => setCategory('bundel')}
            /> Bundel
          </label>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <textarea
            placeholder="Opmerkingen"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button style={{ padding: '0.6rem 1.2rem' }}>
          Conversie opslaan
        </button>

        {saved && <p style={{ color: 'green' }}>✅ Conversie opgeslagen</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {/* ================= LOGS ================= */}
      <hr style={{ margin: '2rem 0' }} />

      <h2>Kliklogs</h2>

      {logs.length === 0 && <p>Nog geen kliks.</p>}

      {logs.length > 0 && (
        <table border="1" cellPadding="8" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Tijd</th>
              <th>Flow</th>
              <th>Event</th>
              <th>IP</th>
              <th>Locatie</th>
              <th>User Agent</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td>{new Date(log.time).toLocaleString()}</td>
                <td>{log.flow || '—'}</td>
                <td>{log.event || '—'}</td>
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
                  ) : '—'}
                </td>
                <td style={{ maxWidth: 400, wordBreak: 'break-all' }}>
                  {log.userAgent || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
