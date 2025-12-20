export default function DashboardLogin() {
  const login = () => {
    const pw = prompt('Wachtwoord dashboard');
    if (pw === '2026') {
      window.location.href = '/dashboard?p=2026';
    } else {
      alert('Onjuist wachtwoord');
    }
  };

  return (
    <div style={{ padding: '3rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
      <button onClick={login}>Inloggen.</button>
    </div>
  );
}
