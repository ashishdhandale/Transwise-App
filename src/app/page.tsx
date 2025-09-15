'use client';

import { Suspense } from 'react';
import DashboardLayout from './(dashboard)/layout';
import DashboardPage from './(dashboard)/page';

// This is the default page, which we'll use for the "Branch" user role.
function App() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}

export default function RootPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  );
}
