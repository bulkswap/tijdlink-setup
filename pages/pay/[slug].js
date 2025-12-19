import redis from '../../lib/redis';

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const { verified } = context.query;

  const parsed = await redis.get(`slug-${slug}`);
  if (!parsed) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  const now = Date.now();
  const validFor = 7 * 60 * 1000;

  // ✅ SLUG altijd indexeren (dit was het probleem)
  await redis.lpush('all-slugs', slug);

  // 🔐 verify flow
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

  // ⏱️ expiry (NIET voor verify-blocked)
  if (
    parsed.flow !== 'verify-blocked' &&
    parsed.firstClick &&
    now - parsed.firstClick >= validFor
  ) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  // ⏱️ start timer
  if (!parsed.firstClick && parsed.flow !== 'verify-blocked') {
    await redis.set(`slug-${slug}`, {
      ...parsed,
      firstClick: now,
    });
  }

  // 🚫 verify-blocked → altijd niet beschikbaar
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
