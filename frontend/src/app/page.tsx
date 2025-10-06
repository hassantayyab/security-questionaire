'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to knowledge-base as the default page
    router.replace('/knowledge-base');
  }, [router]);

  return null;
}
