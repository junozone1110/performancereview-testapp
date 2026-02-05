'use client';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const sizes = {
  small: 20,
  medium: 32,
  large: 48,
};

export function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
  const pixelSize = sizes[size];

  return (
    <div
      className="ab-flex ab-flex-column ab-items-center ab-justify-center ab-gap-3"
      style={{ padding: '16px' }}
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 24 24"
        style={{
          animation: 'spin 1s linear infinite',
        }}
      >
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#e0e0e0"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="#1976d2"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      {message && (
        <p className="ab-text-body-m ab-text-secondary">{message}</p>
      )}
    </div>
  );
}
