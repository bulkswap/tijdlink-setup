import { useEffect, useState } from 'react';

export async function getServerSideProps(ctx) {
  return { props: { slug: ctx.params.slug } };
}

export default function Verify({ slug }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await fetch('/api/store-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        });

        window.location.href = `/pay/${slug}`;
      },
      () => {
        setError(
          'Geef eerst toegang tot locatie om gebruik te maken van deze betaallink.'
        );
      }
    );
  }, [slug]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🇳🇱 Locatie vereist</h1>
      <p>Bevestig je locatie om door te gaan.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
