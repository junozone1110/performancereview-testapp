'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button, Textfield } from '@giftee/abukuma-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await signIn('credentials', { email, callbackUrl: '/dashboard' });
  };

  return (
    <div
      className="ab-flex ab-items-center ab-justify-center"
      style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}
    >
      <div
        className="ab-bg-base ab-rounded-md ab-p-8"
        style={{ width: '100%', maxWidth: '400px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        <div className="ab-flex ab-flex-column ab-gap-6">
          <div className="ab-text-center">
            <h1 className="ab-text-heading-l ab-text-default ab-mb-2">目標評価システム</h1>
            <p className="ab-text-body-m ab-text-secondary">ログインしてください</p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="outlined"
            style={{ width: '100%' }}
          >
            <span className="ab-flex ab-items-center ab-justify-center ab-gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google でログイン
            </span>
          </Button>

          {process.env.NODE_ENV !== 'production' && (
            <>
              <div className="ab-flex ab-items-center ab-gap-4">
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
                <span className="ab-text-body-s ab-text-secondary">開発用ログイン</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
              </div>

              <form onSubmit={handleDevLogin} className="ab-flex ab-flex-column ab-gap-4">
                <Textfield
                  label="メールアドレス"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" variant="default" disabled={isLoading || !email}>
                  開発用ログイン
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
