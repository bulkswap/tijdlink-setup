import redis from '../../lib/redis';

export async function getServerSideProps({ params, req }) {
  const { slug } = params;

  const parsed = await redis.get(`slug-${slug}`);
  if (!parsed) {
    return { notFound: true };
  }

  const now = Date.now();

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown';

  const userAgent = req.headers['user-agent'] || 'unknown';

  /* --------------------------------------------------
     SLUG BLOKKEREN → verify-blocked
  -------------------------------------------------- */
  await redis.set(`slug-${slug}`, {
    ...parsed,
    flow: 'verify-blocked',
  });

  /* --------------------------------------------------
     LOG: slug handmatig geblokkeerd
  -------------------------------------------------- */
  const logId = `log-${slug}-${now}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const logData = {
    id: logId,
    slug,
    flow: 'system',
    event: 'slug-blocked',
    ip,
    userAgent,
    time: now,
  };

  await redis.set(logId, logData);
  await redis.zadd('logs:index', {
    score: now,
    member: logId,
  });

  return { props: {} };
}

export default function Blocked() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Done</h1>
      <p>Deze link is geblokkeerd.</p>
    </div>
  );
}
