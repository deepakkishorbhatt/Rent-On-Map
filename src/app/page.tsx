import { Suspense } from 'react';
import PropertySearch from '@/components/PropertySearch';

export default function Home() {
  return (
    <main className="h-[100dvh] w-full overflow-hidden">
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
        <PropertySearch />
      </Suspense>
    </main>
  );
}
