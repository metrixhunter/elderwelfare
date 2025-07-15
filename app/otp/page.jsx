import { Suspense } from 'react';
import OtpClient from './OtpClient';

export default function OtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpClient />
    </Suspense>
  );
}