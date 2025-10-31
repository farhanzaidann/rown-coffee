import { Suspense } from 'react';
import ConfirmationPageClient from './ConfirmationPageClient';

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p>Memuat halaman konfirmasi...</p>
        </div>
      </div>
    }>
      <ConfirmationPageClient />
    </Suspense>
  );
}