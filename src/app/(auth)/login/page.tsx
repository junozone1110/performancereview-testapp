'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button, Textfield } from '@giftee/abukuma-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      callbackUrl: '/dashboard',
      redirect: false,
    });

    if (result?.error) {
      setError('ログインに失敗しました。メールアドレスを確認してください。');
      setIsLoading(false);
    } else if (result?.ok) {
      window.location.href = '/dashboard';
    }
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
            <p className="ab-text-body-m ab-text-secondary">メールアドレスでログイン</p>
          </div>

          <form onSubmit={handleLogin} className="ab-flex ab-flex-column ab-gap-4">
            <Textfield
              label="メールアドレス"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            {error && (
              <p className="ab-text-body-s" style={{ color: '#d32f2f' }}>
                {error}
              </p>
            )}

            <Button type="submit" variant="default" disabled={isLoading || !email}>
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
