'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const links = [
  { href: '/budgeting', label: '💰 Budgeting' },
  { href: '/saving', label: '🏦 Saving' },
  { href: '/credit', label: '💳 Credit' },
  { href: '/investment', label: '📈 Investment' },
  { href: '/safety', label: '🔒 Financial Safety' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const allowedPages = ['/page', '/budgeting', '/saving', '/safety', '/credit', '/investment'];

  // Debugging: Check if Sidebar should be rendered
  console.log('Rendering Sidebar on:', pathname);

  // 🔹 FIX: Use `.some()` to check if `pathname` **contains** allowed pages
  const showSidebar = allowedPages.some((page) => pathname.includes(page));
  if (!showSidebar) return null; // Hide sidebar on other pages

  return (
    <aside style={{ width: '250px', padding: '1rem', borderRight: '1px solid #ddd' }}>
      <h2>Finedge</h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {links.map(link => (
            <li key={link.href} style={{ margin: '0.5rem 0' }}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}


