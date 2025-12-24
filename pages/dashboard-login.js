import { useState } from 'react';

export default function DashboardLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();

    if (password !== '2026') {
      setError('Onjuist wachtwoord');
      return;
    }

    document.cookie = 'dashboard_auth=ok; path=/; max-age=86400';
    window.location.href = '/dashboard';
  };

  return (
    <div style={{ padding: '3rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard login</h1>

      <form onSubmit={submit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wachtwoord"
        />
        <button>Login</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
