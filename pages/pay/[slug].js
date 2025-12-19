export async function getServerSideProps(context) {
  const { slug } = context.params;
  const { verified } = context.query;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 🔹 Slug ophalen
  const res = await fetch(`${redisUrl}/get/slug-${slug}`, {
    headers: { Authorization: `Bearer ${redisToken}` },
  });

  if (!res.ok) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  const parsed = JSON.parse((await res.json()).result);
  const now = Date.now();
  const validFor = 7 * 60 * 1000;

  // ✅ NIEUW: slug ALTIJD toevoegen aan dashboard index
  await fetch(`${redisUrl}/lpush/all-slugs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(slug),
  });

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

  // ⏱️ timer starten
  if (!parsed.firstClick && parsed.flow !== 'verify-blocked') {
    await fetch(`${redisUrl}/set/slug-${slug}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...parsed, firstClick: now }),
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
