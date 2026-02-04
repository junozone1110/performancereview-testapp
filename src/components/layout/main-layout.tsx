'use client';

import { ReactNode } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />
      <Sidebar />
      <main style={{ marginLeft: '256px', paddingTop: '56px' }}>
        <div className="ab-p-6">{children}</div>
      </main>
    </div>
  );
}
