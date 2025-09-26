'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChallanListRootPage() {
  const router = useRouter();

  useEffect(() => {
    // The login page is at the root path '/'
    router.replace('/');
  }, [router]);

  return null;
}