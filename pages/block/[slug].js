export async function getServerSideProps({ params }) {
  const { slug } = params;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const res = await fetch(`${redisUrl}/get/slug-${slug}`, {
    headers: { Authorization: `Bearer ${redisToken}` },
  });

  if (!res.ok) return { notFound: true };

  const parsed = JSON.parse((await res.json()).result);

  await fetch(`${redisUrl}/set/slug-${slug}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...parsed,
      flow: 'verify-blocked',
    }),
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
