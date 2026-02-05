import Link from 'next/link';
import { Button } from '@giftee/abukuma-react';

export default function NotFound() {
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
            backgroundColor: '#fff3e0',
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
            stroke="#ff9800"
            strokeWidth="2"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h1 className="ab-text-heading-l ab-text-default ab-mb-2">
          ページが見つかりません
        </h1>
        <p className="ab-text-body-m ab-text-secondary ab-mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link href="/dashboard">
          <Button variant="default">ホームへ戻る</Button>
        </Link>
      </div>
    </div>
  );
}
