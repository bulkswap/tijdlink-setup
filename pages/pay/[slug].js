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

  /* --------------------------------------------------
     LOG HELPER (ZSET)
  -------------------------------------------------- */
  const log = async (event) => {
    const id = `log-${slug}-${now}-${Math.random().toString(36).slice(2)}`;

    const data = {
      id,
      slug,
      ip,
      userAgent,
      flow,
      event,
      time: now,
    };

    await redis.set(id, data);
    await redis.zadd('logs:index', {
      score: now,
      member: id,
    });
  };

  /* --------------------------------------------------
     EXPIRED CHECK (behalve verify-blocked)
  -------------------------------------------------- */
  if (
    flow !== 'verify-blocked' &&
    parsed.firstClick &&
    now - parsed.firstClick >= validFor
  ) {
    await log('expired-hit');

    return { redirect: { destination: '/e', permanent: false } };
  }

  /* --------------------------------------------------
     VERIFY FLOW
  -------------------------------------------------- */
  if ((flow === 'verify' || flow === 'verify-blocked') && !verified) {
    await log('verify-redirect');

    return {
      redirect: {
        destination: `/verify/${slug}`,
        permanent: false,
      },
    };
  }

  /* --------------------------------------------------
     FIRST CLICK (start timer)
  -------------------------------------------------- */
  if (!parsed.firstClick && flow !== 'verify-blocked') {
    await redis.set(`slug-${slug}`, {
      ...parsed,
      firstClick: now,
    });
  }

  /* --------------------------------------------------
     VERIFY-BLOCKED (altijd door)
  -------------------------------------------------- */
  if (flow === 'verify-blocked') {
    await log('verify-blocked-redirect');

    return {
      redirect: {
        destination: 'https://tikkie.me/niet-beschikbaar',
        permanent: false,
      },
    };
  }

  /* --------------------------------------------------
     NORMALE REDIRECT
  -------------------------------------------------- */
  await log('redirect');

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
