import { useState } from 'react';

export default function DashboardLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();

    if (password !== '2026') {
      setError('Verkeerd wachtwoord');
      return;
    }

    // simpele cookie (24 uur geldig)
    document.cookie = `dashboard_auth=ok; path=/; max-age=${60 * 60 * 24}`;

    window.location.href = '/dashboard';
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard login</h1>

      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <br /><br />
        <button type="submit">Inloggen</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
