export async function getServerSideProps({ req, query }) {
  const cookie = req.headers.cookie || '';

  if (!cookie.includes('dashboard_auth=ok')) {
    return {
      redirect: {
        destination: '/dashboard-login',
        permanent: false,
      },
    };
  }

  // rest van je dashboard code…
}
