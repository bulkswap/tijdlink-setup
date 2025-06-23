// pages/[slug].js
export async function getServerSideProps(context) {
  const { slug } = context.params;

  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/slug-${slug}`, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
  });

  const data = await response.json();
  let target = null;

  try {
    const parsed = JSON.parse(data.result); // Redis slaat object als string op
    target = parsed?.target;
  } catch (e) {
    console.error("Parsing error:", e);
  }

  if (!target) {
    return {
      notFound: true,
    };
  }

  return {
    redirect: {
      destination: target,
      permanent: false,
    },
  };
}

export default function RedirectPage() {
  return null;
}
