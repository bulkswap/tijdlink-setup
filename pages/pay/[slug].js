import redis from '../../lib/redis';

export async function getServerSideProps({ params, query, req }) {
  const { slug } = params;
  const { verified } = query;

  const parsed = await redis.get(`slug-${slug}`);
  if (!parsed) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  const now = Date.now();
  const validFor = 7 * 60 * 1000;

  // IP + UA
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown';

  const userAgent = req.headers['user-agent'] || 'unknown';

  // ✅ ALTIJD loggen dat iemand op PAY is geweest
  await redis.set(`log-${slug}-${now}`, {
    slug,
    ip,
    userAgent,
    flow: parsed.flow || 'normal',
    event: 'visit',
    time: now,
  });

  // ⏱️ expiry (niet voor verify-blocked)
  if (
    parsed.flow !== 'verify-blocked' &&
    parsed.firstClick &&
    now - parsed.firstClick >= validFor
  ) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  // 🔐 verify nodig?
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

  // ⏱️ start timer (normal + verify)
  if (!parsed.firstClick && parsed.flow !== 'verify-blocked') {
    await redis.set(`slug-${slug}`, {
      ...parsed,
      firstClick: now,
    });
  }

  // dashboard index
  await redis.lpush('all-slugs', slug);

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
