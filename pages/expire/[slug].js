export async function getServerSideProps(context) {
  const { slug } = context.params;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const response = await fetch(`${redisUrl}/get/slug-${slug}`, {
    headers: {
      Authorization: `Bearer ${redisToken}`,
    },
  });

  const data = await response.json();

  if (!data?.result) {
    return { notFound: true };
  }

  let parsed;
  try {
    parsed = JSON.parse(data.result);
  } catch {
    return { notFound: true };
  }

  // ✅ Zet expired op true
  await fetch(`${redisUrl}/set/slug-${slug}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${redisToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...parsed, expired: true })
  });

  return {
    props: {},
  };
}

export default function Expired() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>✅ Done – deze link is nu handmatig verlopen</h1>
    </div>
  );
}
