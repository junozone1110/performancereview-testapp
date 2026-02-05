'use client';

import type { WeightValidation } from '@/types/evaluation';

interface WeightIndicatorProps {
  validation: WeightValidation;
}

export function WeightIndicator({ validation }: WeightIndicatorProps) {
  const { isValid, totalWeight, errors } = validation;

  return (
    <div
      className="ab-bg-base ab-rounded-md ab-p-4"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${isValid ? '#4caf50' : '#f44336'}`,
      }}
    >
      <div className="ab-flex ab-items-center ab-justify-between ab-mb-2">
        <span className="ab-text-heading-xs ab-text-default">ウェイト合計</span>
        <span
          className="ab-text-heading-m"
          style={{ color: isValid ? '#4caf50' : '#f44336' }}
        >
          {totalWeight}%
        </span>
      </div>

      {/* プログレスバー */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(totalWeight, 100)}%`,
            height: '100%',
            backgroundColor: isValid ? '#4caf50' : totalWeight > 100 ? '#f44336' : '#ff9800',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* エラーメッセージ */}
      {errors.length > 0 && (
        <div className="ab-mt-2">
          {errors.map((error, index) => (
            <p
              key={index}
              className="ab-text-body-s"
              style={{ color: '#f44336', margin: '4px 0' }}
            >
              {error}
            </p>
          ))}
        </div>
      )}

      {isValid && (
        <p className="ab-text-body-s ab-mt-2" style={{ color: '#4caf50' }}>
          ウェイト設定は正しく完了しています
        </p>
      )}
    </div>
  );
}
