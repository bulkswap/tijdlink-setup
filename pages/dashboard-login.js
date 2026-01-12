import { useState } from 'react';

export default function DashboardLogin() {
  const [user, setUser] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();

    // 🔐 ADMIN
    if (user === 'admin' && pin === '2026') {
      document.cookie =
        'dashboard_auth=admin; path=/; max-age=86400';
      window.location.href = '/dashboard';
      return;
    }

    // 👤 SUB-USERS (moeten overeenkomen met generate)
    const allowedUsers = {
      fleur: '4821',
      nicole: '7392',
      nicole2: '6184',
    };

    if (allowedUsers[user] && allowedUsers[user] === pin) {
      document.cookie =
        `dashboard_auth=${user}; path=/; max-age=86400`;
      window.location.href = '/dashboard';
      return;
    }

    setError('Onjuiste gebruikersnaam of pincode');
  };

  return (
    <div
      style={{
        padding: '3rem',
        fontFamily: 'sans-serif',
        maxWidth: 400,
        margin: '0 auto',
      }}
    >
      <h1>Dashboard login</h1>

      <form onSubmit={submit}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Gebruiker (admin / fleur / nicole)"
            value={user}
            onChange={(e) => setUser(e.target.value.trim())}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            placeholder="Pincode"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button style={{ padding: '0.5rem 1rem' }}>
          Login
        </button>
      </form>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
