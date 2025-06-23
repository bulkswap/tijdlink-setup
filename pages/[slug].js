// ✅ Bestand: pages/[slug].js
export async function getServerSideProps({ params }) {
  return {
    redirect: {
      destination: `/api/${params.slug}`,
      permanent: false,
    },
  };
}

export default function Page() {
  return null;
}
