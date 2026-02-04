'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
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

  return (
    <aside className="fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background">
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => (
          <RoleGuard key={item.href} allowedRoles={[...item.roles]}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.name}
            </Link>
          </RoleGuard>
        ))}
      </nav>
    </aside>
  );
}
