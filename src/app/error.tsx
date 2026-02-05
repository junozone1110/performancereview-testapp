'use client';

import { useEffect } from 'react';
import { Button } from '@giftee/abukuma-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '16px',
      }}
    >
      <div
        className="ab-bg-base ab-rounded-md ab-p-6"
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ffebee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f44336"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="ab-text-heading-l ab-text-default ab-mb-2">
          エラーが発生しました
        </h1>
        <p className="ab-text-body-m ab-text-secondary ab-mb-6">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        <div className="ab-flex ab-gap-3 ab-justify-center">
          <Button variant="default" onClick={reset}>
            再試行
          </Button>
          <Button variant="outlined" onClick={() => (window.location.href = '/dashboard')}>
            ホームへ戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
