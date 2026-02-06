'use client';

import { useState, useEffect } from 'react';
import { Button } from '@giftee/abukuma-react';
import type { Goal, SelfEvaluationFormData } from '@/types/evaluation';
import { performanceRatingLabels, competencyRatingLabels } from '@/types/evaluation';
import { PerformanceRating, CompetencyRating } from '@/types/enums';

interface SelfEvaluationFormProps {
  goal: Goal;
  onSubmit: (goalId: string, data: SelfEvaluationFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SelfEvaluationForm({
  goal,
  onSubmit,
  onCancel,
  isLoading = false,
}: SelfEvaluationFormProps) {
  const [formData, setFormData] = useState<SelfEvaluationFormData>({
    performanceReflection: '',
    performanceRating: null,
    competencyReflection1: '',
    competencyReflection2: '',
    competencyReflection3: '',
    competencyRating: null,
  });

  useEffect(() => {
    if (goal.selfEvaluation) {
      setFormData({
        performanceReflection: goal.selfEvaluation.performanceReflection || '',
        performanceRating: goal.selfEvaluation.performanceRating,
        competencyReflection1: goal.selfEvaluation.competencyReflection1 || '',
        competencyReflection2: goal.selfEvaluation.competencyReflection2 || '',
        competencyReflection3: goal.selfEvaluation.competencyReflection3 || '',
        competencyRating: goal.selfEvaluation.competencyRating,
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
      <h2 className="ab-text-heading-m ab-text-default ab-mb-2">自己評価</h2>
      <p className="ab-text-body-s ab-text-secondary ab-mb-4">
        目標: {goal.title}
      </p>

      <form onSubmit={handleSubmit} className="ab-flex ab-flex-column ab-gap-4">
        {/* 成果振り返り */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            成果振り返り
          </label>
          <textarea
            value={formData.performanceReflection}
            onChange={(e) =>
              setFormData({ ...formData, performanceReflection: e.target.value })
            }
            placeholder="この期間の成果を振り返って記入してください"
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

        {/* コンピテンシー振り返り */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-2" style={{ display: 'block' }}>
            コンピテンシー振り返り（3項目）
          </label>
          <div className="ab-flex ab-flex-column ab-gap-2">
            <textarea
              value={formData.competencyReflection1}
              onChange={(e) =>
                setFormData({ ...formData, competencyReflection1: e.target.value })
              }
              placeholder="コンピテンシー振り返り 1"
              disabled={isLoading}
              className="ab-text-body-m"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <textarea
              value={formData.competencyReflection2}
              onChange={(e) =>
                setFormData({ ...formData, competencyReflection2: e.target.value })
              }
              placeholder="コンピテンシー振り返り 2"
              disabled={isLoading}
              className="ab-text-body-m"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <textarea
              value={formData.competencyReflection3}
              onChange={(e) =>
                setFormData({ ...formData, competencyReflection3: e.target.value })
              }
              placeholder="コンピテンシー振り返り 3"
              disabled={isLoading}
              className="ab-text-body-m"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>
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
