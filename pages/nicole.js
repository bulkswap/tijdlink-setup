
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
      <button onClick={generateNewSlug} disabled={loading}>
        {loading ? 'Even geduld...' : 'Genereer nieuwe link'}
      </button>
    </div>
  );
}
