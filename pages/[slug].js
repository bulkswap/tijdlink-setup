// pages/[slug].js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getServerSideProps({ params }) {
  const slug = params.slug;
  const key = `slug-${slug}`;
  const entry = await redis.get(key);

  if (!entry) {
    return {
      redirect: {
        destination: '/e',
        permanent: false,
      },
    };
  }

  const now = Date.now();

  if (!entry.firstClick) {
    // eerste bezoek: sla timestamp op
    await redis.set(key, { ...entry, firstClick: now });
    return {
      redirect: {
        destination: entry.target,
        permanent: false,
      },
    };
  }

  const diff = now - entry.firstClick;
  const validFor = 7 * 60 * 1000; // 7 minuten in ms

  if (diff < validFor) {
    return {
      redirect: {
        destination: entry.target,
        permanent: false,
      },
    };
  } else {
    return {
      redirect: {
        destination: '/e',
        permanent: false,
      },
    };
  }
}

export default function Page() {
  return null;
}
