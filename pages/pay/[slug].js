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
  const flow = parsed.flow || 'normal';

  // ❌ NOOIT LOGGEN BIJ VERIFY
  if ((flow === 'verify' || flow === 'verify-blocked') && !verified) {
    return {
      redirect: {
        destination: `/verify/${slug}`,
        permanent: false,
      },
    };
  }

  // ⏱ EXPIRED (alleen normal & verify)
  if (
    flow !== 'verify-blocked' &&
    parsed.firstClick &&
    now - parsed.firstClick > validFor
  ) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  // ⏱ START TIMER
  if (!parsed.firstClick && flow !== 'verify-blocked') {
    await redis.set(`slug-${slug}`, { ...parsed, firstClick: now });
  }

  // 🚫 VERIFY-BLOCKED
  if (flow === 'verify-blocked') {
    return {
      redirect: {
        destination: 'https://tikkie.me/niet-beschikbaar',
        permanent: false,
      },
    };
  }

  // ✅ NORMALE REDIRECT (ENIGE LOG HIER)
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown';

  const userAgent = req.headers['user-agent'] || 'unknown';

  const id = `log-${slug}-${now}`;
  await redis.set(id, {
    id,
    slug,
    flow,
    event: 'redirect',
    ip,
    userAgent,
    time: now,
  });

  await redis.zadd('logs:index', {
    score: now,
    member: id,
  });

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
