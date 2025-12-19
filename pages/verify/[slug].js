import { useState } from 'react';

export async function getServerSideProps({ params }) {
  return { props: { slug: params.slug } };
}

export default function Verify({ slug }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    setLoading(true);

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

        // ✅ DIT WAS HET BELANGRIJKSTE
        window.location.href = `/pay/${slug}?verified=1`;
      },
      async () => {
        await fetch('/api/store-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            denied: true,
          }),
        });

        setError('Locatie is verplicht om verder te gaan.');
        setLoading(false);
      }
    );
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>🇳🇱 Bevestig dat je uit Nederland komt</h1>

      <p>
        Geef eerst toegang tot locatie om gebruik te maken van deze betaallink.
      </p>

      <button
        onClick={requestLocation}
        disabled={loading}
        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
      >
        {loading ? 'Bezig…' : 'Bevestigen met locatie'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>
      )}
    </div>
  );
}
