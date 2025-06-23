// pages/[slug].js
export async function getServerSideProps(context) {
  const { slug } = context.params;
  const userAgent = context.req.headers['user-agent'] || '';
  const isBot = /bot|crawl|slack|discord|whatsapp|telegram|facebook|preview|meta|link|fetch/i.test(userAgent);

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const response = await fetch(`${redisUrl}/get/slug-${slug}`, {
    headers: {
      Authorization: `Bearer ${redisToken}`,
    },
  });

  const data = await response.json();
  if (!data?.result) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  let parsed;
  try {
    parsed = JSON.parse(data.result);
  } catch {
    return { redirect: { destination: '/e', permanent: false } };
  }

  const now = Date.now();
  const validFor = 7 * 60 * 1000; // 7 minuten

  // Als geen firstClick én geen bot → zet firstClick
  if (!parsed.firstClick && !isBot) {
    await fetch(`${redisUrl}/set/slug-${slug}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${redisToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...parsed, firstClick: now })
    });

    return { redirect: { destination: parsed.target, permanent: false } };
  }

  // Als wel firstClick → check of nog geldig
  const diff = now - (parsed.firstClick || 0);
  if (diff < validFor) {
    return { redirect: { destination: parsed.target, permanent: false } };
  }

  // Te laat
  return { redirect: { destination: '/e', permanent: false } };
}

export default function RedirectPage() {
  return null;
}
