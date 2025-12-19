import redis from '../../lib/redis';

export async function getServerSideProps({ params, query }) {
  const { slug } = params;
  const { verified } = query;

  const parsed = await redis.get(`slug-${slug}`);
  if (!parsed) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  // verify vereist
  if (
    (parsed.flow === 'verify' || parsed.flow === 'verify-blocked') &&
    !verified
  ) {
    return {
      redirect: {
        destination: `/verify/${slug}`,
        permanent: false,
      },
    };
  }

  // log indexeren (dashboard)
  await redis.lpush('all-slugs', slug);

  if (parsed.flow === 'verify-blocked') {
    return {
      redirect: {
        destination: 'https://tikkie.me/niet-beschikbaar',
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: parsed.target,
      permanent: false,
    },
  };
}

export default function Page() {
  return null;
}
