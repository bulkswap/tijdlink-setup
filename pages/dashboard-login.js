export async function getServerSideProps({ req }) {
  const cookie = req.headers.cookie || '';

  if (cookie.includes('dashboard_auth=ok')) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return { props: {} };
}

export default function DashboardLogin() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard login</h1>

      <form method="POST" action="/api/dashboard-login">
        <input
          type="password"
          name="password"
          placeholder="Wachtwoord"
          autoFocus
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <br /><br />
        <button type="submit">Inloggen</button>
      </form>
    </div>
  );
}
