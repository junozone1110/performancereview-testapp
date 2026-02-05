'use client';

import { ReactNode, useState, createContext, useContext } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarContext = {
    isOpen: isSidebarOpen,
    toggle: () => setIsSidebarOpen(!isSidebarOpen),
    close: () => setIsSidebarOpen(false),
  };

  return (
    <SidebarContext.Provider value={sidebarContext}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Header />
        <Sidebar />
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              top: '56px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 40,
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="main-content" style={{ marginLeft: '256px', paddingTop: '56px' }}>
          <div className="ab-p-6">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
