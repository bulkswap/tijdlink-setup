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

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown';

  const userAgent = req.headers['user-agent'] || 'unknown';

  const flow = parsed.flow || 'normal';

  /* ---------------- BASIS LOG (ALTIJD) ---------------- */
  await redis.set(`log-${slug}-${now}`, {
    slug,
    ip,
    userAgent,
    flow,
    event: 'visit',
    time: now,
  });

  /* ---------------- EXPIRED CHECK ---------------- */
  if (
    flow !== 'verify-blocked' &&
    parsed.firstClick &&
    now - parsed.firstClick >= validFor
  ) {
    // 🔥 EXTRA LOG: expired hit
    await redis.set(`log-${slug}-${now}-expired`, {
      slug,
      ip,
      userAgent,
      flow,
      event: 'expired-hit',
      time: now,
    });

    return { redirect: { destination: '/e', permanent: false } };
  }

  /* ---------------- VERIFY FLOW ---------------- */
  if ((flow === 'verify' || flow === 'verify-blocked') && !verified) {
    return {
      redirect: {
        destination: `/verify/${slug}`,
        permanent: false,
      },
    };
  }

  /* ---------------- START TIMER ---------------- */
  if (!parsed.firstClick && flow !== 'verify-blocked') {
    await redis.set(`slug-${slug}`, {
      ...parsed,
      firstClick: now,
    });
  }

  /* ---------------- DASHBOARD INDEX ---------------- */
  await redis.lpush('all-slugs', slug);

  /* ---------------- VERIFY-BLOCKED ---------------- */
  if (flow === 'verify-blocked') {
    return {
      redirect: {
        destination: 'https://tikkie.me/niet-beschikbaar',
        permanent: false,
      },
    };
  }

  /* ---------------- NORMALE REDIRECT ---------------- */
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
