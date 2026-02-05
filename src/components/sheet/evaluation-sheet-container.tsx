'use client';

import { useEffect } from 'react';
import { useSheet } from '@/hooks/use-sheet';
import { EvaluationSheetView } from './evaluation-sheet-view';

interface EvaluationSheetContainerProps {
  sheetId: string;
}

export function EvaluationSheetContainer({ sheetId }: EvaluationSheetContainerProps) {
  const {
    sheet,
    isLoading,
    error,
    fetchSheet,
    addGoal,
    updateGoal,
    deleteGoal,
    updateSelfEvaluation,
    updateManagerEvaluation,
    updateTotalEvaluation,
  } = useSheet();

  useEffect(() => {
    fetchSheet(sheetId);
  }, [sheetId, fetchSheet]);

  if (isLoading && !sheet) {
    return (
      <div className="ab-flex ab-items-center ab-justify-center" style={{ minHeight: '400px' }}>
        <p className="ab-text-body-m ab-text-secondary">読み込み中...</p>
      </div>
    );
  }

  if (error && !sheet) {
    return (
      <div className="ab-flex ab-flex-column ab-items-center ab-justify-center ab-gap-4" style={{ minHeight: '400px' }}>
        <p className="ab-text-body-m" style={{ color: '#f44336' }}>{error}</p>
        <button
          onClick={() => fetchSheet(sheetId)}
          className="ab-text-body-m"
          style={{
            padding: '8px 16px',
            border: '1px solid #1976d2',
            borderRadius: '4px',
            color: '#1976d2',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="ab-flex ab-items-center ab-justify-center" style={{ minHeight: '400px' }}>
        <p className="ab-text-body-m ab-text-secondary">シートが見つかりません</p>
      </div>
    );
  }

  return (
    <EvaluationSheetView
      sheet={sheet}
      isLoading={isLoading}
      error={error}
      onAddGoal={addGoal}
      onUpdateGoal={updateGoal}
      onDeleteGoal={deleteGoal}
      onUpdateSelfEvaluation={updateSelfEvaluation}
      onUpdateManagerEvaluation={updateManagerEvaluation}
      onUpdateTotalEvaluation={updateTotalEvaluation}
    />
  );
}
