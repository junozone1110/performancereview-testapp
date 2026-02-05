'use client';

import { Button } from '@giftee/abukuma-react';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onDismiss, onRetry }: ErrorAlertProps) {
  return (
    <div
      className="ab-rounded-md ab-p-4"
      style={{
        backgroundColor: '#ffebee',
        border: '1px solid #f44336',
      }}
      role="alert"
    >
      <div className="ab-flex ab-items-start ab-gap-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f44336"
          strokeWidth="2"
          style={{ flexShrink: 0, marginTop: '2px' }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div style={{ flex: 1 }}>
          <p className="ab-text-body-m" style={{ color: '#c62828' }}>
            {message}
          </p>
          {(onDismiss || onRetry) && (
            <div className="ab-flex ab-gap-2" style={{ marginTop: '8px' }}>
              {onRetry && (
                <Button variant="outlined" size="small" onClick={onRetry}>
                  再試行
                </Button>
              )}
              {onDismiss && (
                <Button variant="text" size="small" onClick={onDismiss}>
                  閉じる
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
