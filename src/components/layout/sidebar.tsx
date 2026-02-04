'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { RoleGuard } from './role-guard';

const navigation = [
  {
    name: 'マイページ',
    href: '/dashboard',
    roles: ['employee', 'manager', 'hr'] as const,
  },
  {
    name: '部下一覧',
    href: '/team',
    roles: ['manager', 'hr'] as const,
  },
  {
    name: '全従業員一覧',
    href: '/employees',
    roles: ['hr'] as const,
  },
  {
    name: '評価期間管理',
    href: '/periods',
    roles: ['hr'] as const,
  },
  {
    name: '組織インポート',
    href: '/import',
    roles: ['hr'] as const,
  },
  {
    name: '追加閲覧者設定',
    href: '/viewers',
    roles: ['hr'] as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className="ab-bg-base"
      style={{
        position: 'fixed',
        left: 0,
        top: '56px',
        zIndex: 40,
        height: 'calc(100vh - 56px)',
        width: '256px',
        borderRight: '1px solid #e0e0e0',
      }}
    >
      <nav className="ab-flex ab-flex-column ab-gap-1 ab-p-4">
        {navigation.map((item) => (
          <RoleGuard key={item.href} allowedRoles={[...item.roles]}>
            <Link
              href={item.href}
              className={`ab-flex ab-items-center ab-gap-3 ab-rounded-md ab-px-3 ab-py-2 ab-text-body-m ${
                isActive(item.href)
                  ? 'ab-bg-rest-primary ab-text-on-primary'
                  : 'ab-text-secondary ab-bg-base'
              }`}
              style={{
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
            >
              {item.name}
            </Link>
          </RoleGuard>
        ))}
      </nav>
    </aside>
  );
}
