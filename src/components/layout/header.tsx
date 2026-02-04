'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@giftee/abukuma-react';
import { getHighestRole } from '@/lib/permissions';
import { useState } from 'react';

const roleLabels = {
  employee: '従業員',
  manager: '管理職',
  hr: 'HR',
};

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const highestRole = user?.roles ? getHighestRole(user.roles) : 'employee';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className="ab-flex ab-items-center ab-px-4 ab-bg-base"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '56px',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <div className="ab-flex ab-items-center ab-gap-2">
        <span className="ab-text-heading-m ab-text-default">目標評価システム</span>
      </div>

      <div className="ab-flex ab-items-center ab-gap-4" style={{ marginLeft: 'auto' }}>
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ab-flex ab-items-center ab-justify-center ab-rounded-full ab-bg-rest-primary ab-text-on-primary"
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {getInitials(user.name || 'U')}
            </button>

            {isMenuOpen && (
              <div
                className="ab-bg-base ab-rounded-md ab-p-4"
                style={{
                  position: 'absolute',
                  top: '40px',
                  right: 0,
                  minWidth: '200px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                }}
              >
                <div className="ab-flex ab-flex-column ab-gap-1 ab-mb-4">
                  <p className="ab-text-body-m ab-text-default">{user.name}</p>
                  <p className="ab-text-body-s ab-text-secondary">{user.email}</p>
                  <p className="ab-text-body-s ab-text-secondary">{roleLabels[highestRole]}</p>
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  style={{ width: '100%' }}
                >
                  ログアウト
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
