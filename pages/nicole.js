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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Gekopieerd!');
  };

  const handleCopyAndRefresh = (text) => {
    navigator.clipboard.writeText(text);
    alert('Gekopieerd!');
    location.reload(); // alleen bij Tikkie-tekst
  };

  const baseUrl = 'https://betaalverzoek.nu';
  const tikkieText = slug
    ? `💖 Wil je mij alsjeblieft betalen voor 'Tikkie' via ${baseUrl}/${slug}\n\nVia deze link kun je €50 betalen`
    : '';

  const bolText = `💖 Wil je mij alsjeblieft betalen via bol cadeaukaart? Binnen 1 minuut via: https://beltegoed.nl/bol-com-cadeaukaart\n\nVia deze link kun je €50 betalen`;

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
          <div style={{ marginTop: '2rem' }}>
            <textarea
              style={{ width: '100%', height: '120px' }}
              readOnly
              value={tikkieText}
            />
            <button onClick={() => handleCopyAndRefresh(tikkieText)}>Kopieer Tikkie-tekst</button>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <textarea
              style={{ width: '100%', height: '120px' }}
              readOnly
              value={bolText}
            />
            <button onClick={() => handleCopy(bolText)}>Kopieer Bol-tekst</button>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <textarea
              style={{ width: '100%', height: '80px' }}
              readOnly
              value={bankText}
            />
            <button onClick={() => handleCopy(bankText)}>Kopieer Bank-tekst</button>
          </div>
        </>
      )}

      <div style={{ marginTop: '4rem', borderTop: '1px solid #ccc', paddingTop: '2rem' }}>
        <button onClick={generateNewSlug} disabled={loading}>
          {loading ? 'Even geduld...' : 'Genereer nieuwe link'}
        </button>
      </div>
    </div>
  );
}
