

'use client';
// This file is now a directory. 
// Redirecting to the main customer ledger page.
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountsRootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/company/accounts/customer-ledger');
  }, [router]);
  return null;
}
