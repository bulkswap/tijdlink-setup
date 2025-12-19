export async function getServerSideProps(context) {
  const { slug } = context.params;
  const req = context.req;

  const userAgent = req.headers['user-agent'] || '';
  const isBot = /bot|crawl|slack|discord|whatsapp|telegram|facebook|preview|meta|link|fetch/i.test(userAgent);

  // 🔹 IP correct bepalen
  let ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  // IPv6 localhost normaliseren
  if (ip === '::1') ip = 'unknown';

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  /* ---------------- BLACKLIST ---------------- */
  const blacklistCheck = await fetch(`${redisUrl}/get/blacklist-${ip}`, {
    headers: { Authorization: `Bearer ${redisToken}` },
  }).then(r => r.json()).catch(() => null);

  if (blacklistCheck?.result === 'true') {
    return {
      redirect: {
        destination: 'https://betaalverzoek.nu/geblokkeerd',
        permanent: false,
      },
    };
  }

  /* ---------------- SLUG OPHALEN ---------------- */
  const response = await fetch(`${redisUrl}/get/slug-${slug}`, {
    headers: { Authorization: `Bearer ${redisToken}` },
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

  if (parsed.expired === true) {
    return { redirect: { destination: '/e', permanent: false } };
  }

  // 🤖 Bots nooit loggen / timer starten
  if (isBot) {
    return { redirect: { destination: parsed.target, permanent: false } };
  }

  const now = Date.now();
  const validFor = 7 * 60 * 1000;

  /* ---------------- GEO IP (alleen als zinvol) ---------------- */
  let geo = {};
  if (
    ip !== 'unknown' &&
    !ip.startsWith('127.') &&
    !ip.startsWith('10.') &&
    !ip.startsWith('192.168.')
  ) {
    geo = await fetch(`https://ipapi.co/${ip}/json/`)
      .then(r => r.json())
      .catch(() => ({}));
  }

  /* ---------------- LOGGEN ---------------- */
  const logData = {
    slug,
    ip,
    country: geo.country_name || null,
    region: geo.region || null,
    city: geo.city || null,
    userAgent,
    time: now,
  };

  await fetch(`${redisUrl}/set/log-${slug}-${now}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  });

  /* ---------------- FIRST CLICK ---------------- */
  if (!parsed.firstClick) {
    await fetch(`${redisUrl}/set/slug-${slug}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...parsed, firstClick: now }),
    });

    return { redirect: { destination: parsed.target, permanent: false } };
  }

  /* ---------------- BINNEN TIJD ---------------- */
  if (now - parsed.firstClick < validFor) {
    return { redirect: { destination: parsed.target, permanent: false } };
  }

  /* ---------------- VERLOPEN ---------------- */
  return { redirect: { destination: '/e', permanent: false } };
}

export default function RedirectPage() {
  return null;
}
