'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with home/dashboard
    breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });

    // Build breadcrumbs from path segments
    let currentPath = '';
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip dashboard since we already added it
      if (segment === 'dashboard') return;

      // Format the label
      let label = segment;

      // Custom labels for known routes
      if (segment === 'audits' && paths[index + 1]) {
        label = 'Audit Detail';
      } else if (segment === 'reports' && paths[index + 1] && paths[index + 1] !== 'new') {
        label = 'Report Detail';
      } else if (segment === 'new') {
        label = 'New';
      } else if (segment === 'share') {
        label = 'Shared Report';
      } else {
        // Capitalize and replace dashes with spaces
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      // Don't add IDs as breadcrumbs
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) &&
          !/^[a-zA-Z0-9_-]{20,}$/.test(segment)) {
        breadcrumbs.push({ label, href: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard page
  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-primary transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.slice(1).map((item, index) => {
        const isLast = index === breadcrumbs.length - 2;

        return (
          <Fragment key={item.href}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
