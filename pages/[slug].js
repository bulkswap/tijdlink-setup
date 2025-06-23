
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function RedirectPage() {
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (slug) {
      window.location.href = `/api/redirect?slug=${slug}`;
    }
  }, [slug]);

  return <p>Je wordt doorgestuurd...</p>;
}
