import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Nicole() {
  const [slug, setSlug] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateNewSlug = async () => {
    setLoading(true);
    const res = await fetch('/api/generate');
    const { slug: newSlug } = await res.json();
    setSlug(newSlug);
    setLoading(false);
  };

  useEffect(() => {
    generateNewSlug();
  }, []);

  const handleCopyAndRefresh = (text) => {
    navigator.clipboard.writeText(text);
    alert('Gekopieerd!');
    location.reload();
  };

  const baseUrl = 'https://betaalverzoek.nu';

  const tikkieTexts = {
    30: (slug) => `💖 Wil je mij alsjeblieft betalen voor 'Tikkie' via ${baseUrl}/${slug}\n\nVia deze link kun je €30 betalen`,
    50: (slug) => `💖 Wil je mij alsjeblieft betalen voor 'Tikkie' via ${baseUrl}/${slug}\n\nVia deze link kun je €50 betalen`,
    70: (slug) => `💖 Wil je mij alsjeblieft betalen voor 'Tikkie' via ${baseUrl}/${slug}\n\nVia deze link kun je €70 betalen`,
  };

  const bolTexts = {
    30: `💖 Wil je mij alsjeblieft betalen via bol cadeaukaart? Binnen 1 minuut via: https://beltegoed.nl/order?productId=56280&quantity=1\n\nVia deze link kun je €30 betalen`,
    50: `💖 Wil je mij alsjeblieft betalen via bol cadeaukaart? Binnen 1 minuut via: https://beltegoed.nl/order?productId=56361&quantity=1\n\nVia deze link kun je €50 betalen`,
    70: `💖 Wil je mij alsjeblieft betalen via bol cadeaukaart? Binnen 1 minuut via: https://beltegoed.nl/order?productId=88345&quantity=1\n\nVia deze link kun je €70 betalen`,
  };

  const bankText = `Liever via handmatige bankoverschrijving betalen? Dat kan ook: NL34BUNQ2106132808 tnv K. Bohak`;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <Head>
        <title>Link Generator</title>
        <meta name="robots" content="noindex" />
      </Head>

      <h1>Actieve redirect link</h1>
      {slug ? (
        <p>
          <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
            /{slug}
          </a>
        </p>
      ) : (
        <p>Loading...</p>
      )}

      {slug && (
        <>
          {/* Tikkie €30 */}
          <div style={{ marginTop: '2rem' }}>
            <textarea
              style={{ width: '100%', height: '120px' }}
              readOnly
              value={tikkieTexts[30](slug)}
            />
            <button onClick={() => handleCopyAndRefresh(tikkieTexts[30](slug))}>Kopieer €30 Tikkie-tekst</button>
          </div>

          {/* Tikkie Extra opties */}
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => handleCopyAndRefresh(tikkieTexts[50](slug))}>Kopieer €50 Tikkie-tekst</button>{' '}
            <button onClick={() => handleCopyAndRefresh(tikkieTexts[70](slug))}>Kopieer €70 Tikkie-tekst</button>
          </div>

          {/* Bol €30 */}
          <div style={{ marginTop: '2rem' }}>
            <textarea
              style={{ width: '100%', height: '120px' }}
              readOnly
              value={bolTexts[30]}
            />
            <button onClick={() => handleCopyAndRefresh(bolTexts[30])}>Kopieer €30 Bol-tekst</button>
          </div>

          {/* Bol Extra opties */}
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => handleCopyAndRefresh(bolTexts[50])}>Kopieer €50 Bol-tekst</button>{' '}
            <button onClick={() => handleCopyAndRefresh(bolTexts[70])}>Kopieer €70 Bol-tekst</button>
          </div>

          {/* Bankoverschrijving */}
          <div style={{ marginTop: '2rem' }}>
            <textarea
              style={{ width: '100%', height: '80px' }}
              readOnly
              value={bankText}
            />
            <button onClick={() => navigator.clipboard.writeText(bankText)}>Kopieer Bank-tekst</button>
          </div>
        </>
      )}

      <div style={{ marginTop: '3rem' }}>
        <button onClick={generateNewSlug} disabled={loading}>
          {loading ? 'Even geduld...' : 'Genereer nieuwe link'}
        </button>
      </div>
    </div>
  );
}
