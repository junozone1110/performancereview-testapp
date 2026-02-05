'use client';

import { useState, useEffect } from 'react';
import { Button } from '@giftee/abukuma-react';
import type { Goal, ManagerEvaluationFormData } from '@/types/evaluation';
import { performanceRatingLabels, competencyRatingLabels } from '@/types/evaluation';
import { PerformanceRating, CompetencyRating } from '@prisma/client';

interface ManagerEvaluationFormProps {
  goal: Goal;
  onSubmit: (goalId: string, data: ManagerEvaluationFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ManagerEvaluationForm({
  goal,
  onSubmit,
  onCancel,
  isLoading = false,
}: ManagerEvaluationFormProps) {
  const [formData, setFormData] = useState<ManagerEvaluationFormData>({
    performanceComment: '',
    performanceRating: null,
    competencyComment: '',
    competencyRating: null,
  });

  useEffect(() => {
    if (goal.managerEvaluation) {
      setFormData({
        performanceComment: goal.managerEvaluation.performanceComment || '',
        performanceRating: goal.managerEvaluation.performanceRating,
        competencyComment: goal.managerEvaluation.competencyComment || '',
        competencyRating: goal.managerEvaluation.competencyRating,
      });
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(goal.id, formData);
  };

  const performanceRatings = Object.keys(performanceRatingLabels) as PerformanceRating[];
  const competencyRatings = Object.keys(competencyRatingLabels) as CompetencyRating[];

  return (
    <div
      className="ab-bg-base ab-rounded-md ab-p-6"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 1000,
      }}
    >
      <h2 className="ab-text-heading-m ab-text-default ab-mb-2">上長評価</h2>
      <p className="ab-text-body-s ab-text-secondary ab-mb-4">
        目標: {goal.title}
      </p>

      {/* 自己評価の参照表示 */}
      {goal.selfEvaluation && (
        <div
          className="ab-bg-base ab-rounded-md ab-p-4 ab-mb-4"
          style={{ backgroundColor: '#f5f5f5' }}
        >
          <h3 className="ab-text-heading-xs ab-text-default ab-mb-2">自己評価（参照）</h3>
          <div className="ab-flex ab-flex-column ab-gap-2">
            <div>
              <span className="ab-text-body-s ab-text-secondary">成果振り返り: </span>
              <span className="ab-text-body-s ab-text-default">
                {goal.selfEvaluation.performanceReflection || '未入力'}
              </span>
            </div>
            <div>
              <span className="ab-text-body-s ab-text-secondary">自己評価: </span>
              <span className="ab-text-body-s ab-text-default">
                {goal.selfEvaluation.performanceRating
                  ? performanceRatingLabels[goal.selfEvaluation.performanceRating]
                  : '未入力'}
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ab-flex ab-flex-column ab-gap-4">
        {/* 成果コメント */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            成果コメント
          </label>
          <textarea
            value={formData.performanceComment}
            onChange={(e) =>
              setFormData({ ...formData, performanceComment: e.target.value })
            }
            placeholder="成果に対するコメントを入力してください"
            disabled={isLoading}
            className="ab-text-body-m"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* 成果評価 */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-2" style={{ display: 'block' }}>
            成果評価
          </label>
          <div className="ab-flex ab-gap-2 ab-flex-wrap">
            {performanceRatings.map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, performanceRating: rating })}
                disabled={isLoading}
                className="ab-text-body-m ab-rounded-md"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  backgroundColor:
                    formData.performanceRating === rating ? '#1976d2' : 'white',
                  color: formData.performanceRating === rating ? 'white' : '#333',
                  cursor: 'pointer',
                }}
              >
                {performanceRatingLabels[rating]}
              </button>
            ))}
          </div>
        </div>

        {/* コンピテンシーコメント */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            コンピテンシーコメント
          </label>
          <textarea
            value={formData.competencyComment}
            onChange={(e) =>
              setFormData({ ...formData, competencyComment: e.target.value })
            }
            placeholder="コンピテンシーに対するコメントを入力してください"
            disabled={isLoading}
            className="ab-text-body-m"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* コンピテンシー評価 */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-2" style={{ display: 'block' }}>
            コンピテンシー評価
          </label>
          <div className="ab-flex ab-gap-2 ab-flex-wrap">
            {competencyRatings.map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, competencyRating: rating })}
                disabled={isLoading}
                className="ab-text-body-m ab-rounded-md"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  backgroundColor:
                    formData.competencyRating === rating ? '#1976d2' : 'white',
                  color: formData.competencyRating === rating ? 'white' : '#333',
                  cursor: 'pointer',
                }}
              >
                {competencyRatingLabels[rating]}
              </button>
            ))}
          </div>
        </div>

        <div className="ab-flex ab-gap-2 ab-justify-end ab-mt-4">
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
            キャンセル
          </Button>
          <Button type="submit" variant="default" disabled={isLoading}>
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </div>
  );
}
