export async function getServerSideProps(ctx) {
  const { slug } = ctx.params;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const res = await fetch(`${redisUrl}/get/slug-${slug}`, {
    headers: { Authorization: `Bearer ${redisToken}` },
  });

  if (!res.ok) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  const parsed = JSON.parse((await res.json()).result);
  const now = Date.now();
  const validFor = 7 * 60 * 1000;

  /* ⛔ EXPIRY ALLEEN VOOR NORMAL & VERIFY */
  if (
    parsed.flow !== 'verify-blocked' &&
    parsed.firstClick &&
    now - parsed.firstClick >= validFor
  ) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  /* 🔐 LOCATIE ALTIJD VERPLICHT */
  if (parsed.flow === 'verify' || parsed.flow === 'verify-blocked') {
    return {
      redirect: {
        destination: `/verify/${slug}`,
        permanent: false,
      },
    };
  }

  /* ⏱️ TIMER START */
  if (!parsed.firstClick) {
    await fetch(`${redisUrl}/set/slug-${slug}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...parsed, firstClick: now }),
    });
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
