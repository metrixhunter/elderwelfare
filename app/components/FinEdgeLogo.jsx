'use client';

import Image from 'next/image';

export default function FinEdgeLogo() {
  return (
    <Image
      src="/logo/logo.png" // ✅ Load logo from public/logo folder
      alt="FinEdge Logo"
      width={400} // Adjust as needed
      height={400}
      draggable="false" // Adjust as needed
    />
  );
}


  