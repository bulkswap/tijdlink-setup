// pages/nicole.js
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Nicole() {
  const [slug, setSlug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateNewSlug = async () => {
    setLoading(true);
    const res = await fetch('/api/generate');
    const { slug: newSlug } = await res.json();
    setSlug(newSlug);
    setCopied(false);
    setLoading(false);
  };

  const copyText = async () => {
    const text = `💖 Wil je mij alsjeblieft betalen voor 'Tikkie' via https://${window.location.host}/${slug}

Via deze link kun je €10 betalen`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  useEffect(() => {
    generateNewSlug();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <Head>
        <title>Link Generator</title>
        <meta name="robots" content="noindex" />
      </Head>
      <h1>Actieve redirect link</h1>

      {slug ? (
        <>
          <p>
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
              /{slug}
            </a>
          </p>

          <div style={{ marginTop: '1rem', whiteSpace: 'pre-line' }}>
            <p>
              💖 Wil je mij alsjeblieft betalen voor 'Ticket' via{' '}
              <strong>https://{typeof window !== 'undefined' && window.location.host}/{slug}</strong>
              <br /><br />
              Via deze link kun je €10 betalen
            </p>
            <button onClick={copyText} disabled={!slug}>
              {copied ? 'Gekopieerd!' : 'Kopieer tekst'}
            </button>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}

      <button style={{ marginTop: '1.5rem' }} onClick={generateNewSlug} disabled={loading}>
        {loading ? 'Even geduld...' : 'Genereer nieuwe link'}
      </button>
    </div>
  );
}
