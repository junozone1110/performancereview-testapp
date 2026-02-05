'use client';

import { useState } from 'react';
import { Button } from '@giftee/abukuma-react';
import type { TotalEvaluation, MgrJudgmentFormData, HrJudgmentFormData } from '@/types/evaluation';
import {
  competencyRatingLabels,
  gradeLabels,
  treatmentLabels,
} from '@/types/evaluation';
import { CompetencyRating, Grade, Treatment } from '@prisma/client';

interface TotalEvaluationSectionProps {
  totalEvaluation: TotalEvaluation | null;
  averageScore: number | null;
  canEditMgrJudgment: boolean;
  canEditHrJudgment: boolean;
  showMgrJudgment: boolean;
  showHrJudgment: boolean;
  onEditMgrJudgment?: () => void;
  onEditHrJudgment?: () => void;
}

export function TotalEvaluationSection({
  totalEvaluation,
  averageScore,
  canEditMgrJudgment,
  canEditHrJudgment,
  showMgrJudgment,
  showHrJudgment,
  onEditMgrJudgment,
  onEditHrJudgment,
}: TotalEvaluationSectionProps) {
  return (
    <div
      className="ab-bg-base ab-rounded-md ab-p-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
    >
      <h2 className="ab-text-heading-m ab-text-default ab-mb-4">総評</h2>

      <div className="ab-flex ab-flex-column ab-gap-4">
        {/* 平均点 */}
        <div
          className="ab-rounded-md ab-p-4"
          style={{ backgroundColor: '#f5f5f5' }}
        >
          <div className="ab-flex ab-items-center ab-justify-between">
            <span className="ab-text-body-m ab-text-secondary">平均点（自動計算）</span>
            <span className="ab-text-heading-l ab-text-default">
              {averageScore !== null ? averageScore.toFixed(2) : '-'}
            </span>
          </div>
        </div>

        {/* コンピテンシーレベル */}
        <div>
          <div className="ab-flex ab-items-center ab-justify-between ab-mb-2">
            <span className="ab-text-body-m ab-text-secondary">コンピテンシーレベル</span>
            <span className="ab-text-body-m ab-text-default">
              {totalEvaluation?.competencyLevel
                ? competencyRatingLabels[totalEvaluation.competencyLevel]
                : '-'}
            </span>
          </div>
          {totalEvaluation?.competencyLevelReason && (
            <p className="ab-text-body-s ab-text-secondary">
              理由: {totalEvaluation.competencyLevelReason}
            </p>
          )}
        </div>

        {/* Mgr判断 */}
        {showMgrJudgment && (
          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
            <div className="ab-flex ab-items-center ab-justify-between ab-mb-3">
              <h3 className="ab-text-heading-s ab-text-default">Mgr判断</h3>
              {canEditMgrJudgment && (
                <Button variant="outlined" size="small" onClick={onEditMgrJudgment}>
                  {totalEvaluation?.mgrTreatment ? '編集' : '入力'}
                </Button>
              )}
            </div>

            <div className="ab-flex ab-flex-column ab-gap-2">
              <div className="ab-flex ab-items-center ab-justify-between">
                <span className="ab-text-body-s ab-text-secondary">処置</span>
                <span className="ab-text-body-m ab-text-default">
                  {totalEvaluation?.mgrTreatment
                    ? treatmentLabels[totalEvaluation.mgrTreatment]
                    : '-'}
                </span>
              </div>
              <div className="ab-flex ab-items-center ab-justify-between">
                <span className="ab-text-body-s ab-text-secondary">昇給額</span>
                <span className="ab-text-body-m ab-text-default">
                  {totalEvaluation?.mgrSalaryChange != null
                    ? `${totalEvaluation!.mgrSalaryChange!.toLocaleString()}円`
                    : '-'}
                </span>
              </div>
              {totalEvaluation?.mgrTreatmentComment && (
                <div>
                  <span className="ab-text-body-s ab-text-secondary">コメント: </span>
                  <span className="ab-text-body-s ab-text-default">
                    {totalEvaluation.mgrTreatmentComment}
                  </span>
                </div>
              )}
              <div className="ab-flex ab-items-center ab-justify-between">
                <span className="ab-text-body-s ab-text-secondary">等級</span>
                <span className="ab-text-body-m ab-text-default">
                  {totalEvaluation?.mgrGrade ? gradeLabels[totalEvaluation.mgrGrade] : '-'}
                </span>
              </div>
              {totalEvaluation?.mgrGradeComment && (
                <div>
                  <span className="ab-text-body-s ab-text-secondary">等級コメント: </span>
                  <span className="ab-text-body-s ab-text-default">
                    {totalEvaluation.mgrGradeComment}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HR判断 */}
        {showHrJudgment && (
          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
            <div className="ab-flex ab-items-center ab-justify-between ab-mb-3">
              <h3 className="ab-text-heading-s ab-text-default">HR判断</h3>
              {canEditHrJudgment && (
                <Button variant="outlined" size="small" onClick={onEditHrJudgment}>
                  {totalEvaluation?.hrTreatment ? '編集' : '入力'}
                </Button>
              )}
            </div>

            <div className="ab-flex ab-flex-column ab-gap-2">
              <div className="ab-flex ab-items-center ab-justify-between">
                <span className="ab-text-body-s ab-text-secondary">最終処置</span>
                <span className="ab-text-body-m ab-text-default">
                  {totalEvaluation?.hrTreatment
                    ? treatmentLabels[totalEvaluation.hrTreatment]
                    : '-'}
                </span>
              </div>
              <div className="ab-flex ab-items-center ab-justify-between">
                <span className="ab-text-body-s ab-text-secondary">最終昇給額</span>
                <span className="ab-text-body-m ab-text-default">
                  {totalEvaluation?.hrSalaryChange != null
                    ? `${totalEvaluation!.hrSalaryChange!.toLocaleString()}円`
                    : '-'}
                </span>
              </div>
              <div className="ab-flex ab-items-center ab-justify-between">
                <span className="ab-text-body-s ab-text-secondary">最終等級</span>
                <span className="ab-text-body-m ab-text-default">
                  {totalEvaluation?.hrGrade ? gradeLabels[totalEvaluation.hrGrade] : '-'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mgr判断フォーム
interface MgrJudgmentFormProps {
  totalEvaluation: TotalEvaluation | null;
  onSubmit: (data: MgrJudgmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MgrJudgmentForm({
  totalEvaluation,
  onSubmit,
  onCancel,
  isLoading = false,
}: MgrJudgmentFormProps) {
  const [formData, setFormData] = useState<MgrJudgmentFormData>({
    competencyLevel: totalEvaluation?.competencyLevel || null,
    competencyLevelReason: totalEvaluation?.competencyLevelReason || '',
    mgrTreatment: totalEvaluation?.mgrTreatment || null,
    mgrSalaryChange: totalEvaluation?.mgrSalaryChange || null,
    mgrTreatmentComment: totalEvaluation?.mgrTreatmentComment || '',
    mgrGrade: totalEvaluation?.mgrGrade || null,
    mgrGradeComment: totalEvaluation?.mgrGradeComment || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const competencyRatings = Object.keys(competencyRatingLabels) as CompetencyRating[];
  const treatments = Object.keys(treatmentLabels) as Treatment[];
  const grades = Object.keys(gradeLabels) as Grade[];

  return (
    <div
      className="ab-bg-base ab-rounded-md ab-p-6"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 1000,
      }}
    >
      <h2 className="ab-text-heading-m ab-text-default ab-mb-4">Mgr判断</h2>

      <form onSubmit={handleSubmit} className="ab-flex ab-flex-column ab-gap-4">
        {/* コンピテンシーレベル */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-2" style={{ display: 'block' }}>
            コンピテンシーレベル
          </label>
          <div className="ab-flex ab-gap-2 ab-flex-wrap">
            {competencyRatings.map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, competencyLevel: rating })}
                disabled={isLoading}
                className="ab-text-body-m ab-rounded-md"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  backgroundColor:
                    formData.competencyLevel === rating ? '#1976d2' : 'white',
                  color: formData.competencyLevel === rating ? 'white' : '#333',
                  cursor: 'pointer',
                }}
              >
                {competencyRatingLabels[rating]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            コンピテンシーレベル理由
          </label>
          <textarea
            value={formData.competencyLevelReason}
            onChange={(e) =>
              setFormData({ ...formData, competencyLevelReason: e.target.value })
            }
            placeholder="理由を入力してください"
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

        {/* 処置 */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-2" style={{ display: 'block' }}>
            処置
          </label>
          <div className="ab-flex ab-gap-2">
            {treatments.map((treatment) => (
              <button
                key={treatment}
                type="button"
                onClick={() => setFormData({ ...formData, mgrTreatment: treatment })}
                disabled={isLoading}
                className="ab-text-body-m ab-rounded-md"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  backgroundColor:
                    formData.mgrTreatment === treatment ? '#1976d2' : 'white',
                  color: formData.mgrTreatment === treatment ? 'white' : '#333',
                  cursor: 'pointer',
                }}
              >
                {treatmentLabels[treatment]}
              </button>
            ))}
          </div>
        </div>

        {/* 昇給額 */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            昇給額 (円)
          </label>
          <input
            type="number"
            value={formData.mgrSalaryChange || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                mgrSalaryChange: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="0"
            disabled={isLoading}
            className="ab-text-body-m"
            style={{
              width: '150px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
            }}
          />
        </div>

        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            処置コメント
          </label>
          <textarea
            value={formData.mgrTreatmentComment}
            onChange={(e) =>
              setFormData({ ...formData, mgrTreatmentComment: e.target.value })
            }
            placeholder="コメントを入力してください"
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

        {/* 等級 */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-2" style={{ display: 'block' }}>
            等級
          </label>
          <div className="ab-flex ab-gap-2 ab-flex-wrap">
            {grades.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setFormData({ ...formData, mgrGrade: grade })}
                disabled={isLoading}
                className="ab-text-body-m ab-rounded-md"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: formData.mgrGrade === grade ? '#1976d2' : 'white',
                  color: formData.mgrGrade === grade ? 'white' : '#333',
                  cursor: 'pointer',
                }}
              >
                {gradeLabels[grade]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            等級コメント
          </label>
          <textarea
            value={formData.mgrGradeComment}
            onChange={(e) =>
              setFormData({ ...formData, mgrGradeComment: e.target.value })
            }
            placeholder="コメントを入力してください"
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

// HR判断フォーム
interface HrJudgmentFormProps {
  totalEvaluation: TotalEvaluation | null;
  onSubmit: (data: HrJudgmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function HrJudgmentForm({
  totalEvaluation,
  onSubmit,
  onCancel,
  isLoading = false,
}: HrJudgmentFormProps) {
  const [formData, setFormData] = useState<HrJudgmentFormData>({
    hrTreatment: totalEvaluation?.hrTreatment || null,
    hrSalaryChange: totalEvaluation?.hrSalaryChange || null,
    hrGrade: totalEvaluation?.hrGrade || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const treatments = Object.keys(treatmentLabels) as Treatment[];
  const grades = Object.keys(gradeLabels) as Grade[];

  return (
    <div
      className="ab-bg-base ab-rounded-md ab-p-6"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 1000,
      }}
    >
      <h2 className="ab-text-heading-m ab-text-default ab-mb-4">HR判断</h2>

      <form onSubmit={handleSubmit} className="ab-flex ab-flex-column ab-gap-4">
        {/* 最終処置 */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-2" style={{ display: 'block' }}>
            最終処置
          </label>
          <div className="ab-flex ab-gap-2">
            {treatments.map((treatment) => (
              <button
                key={treatment}
                type="button"
                onClick={() => setFormData({ ...formData, hrTreatment: treatment })}
                disabled={isLoading}
                className="ab-text-body-m ab-rounded-md"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  backgroundColor:
                    formData.hrTreatment === treatment ? '#1976d2' : 'white',
                  color: formData.hrTreatment === treatment ? 'white' : '#333',
                  cursor: 'pointer',
                }}
              >
                {treatmentLabels[treatment]}
              </button>
            ))}
          </div>
        </div>

        {/* 最終昇給額 */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            最終昇給額 (円)
          </label>
          <input
            type="number"
            value={formData.hrSalaryChange || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                hrSalaryChange: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="0"
            disabled={isLoading}
            className="ab-text-body-m"
            style={{
              width: '150px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* 最終等級 */}
        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-2" style={{ display: 'block' }}>
            最終等級
          </label>
          <div className="ab-flex ab-gap-2 ab-flex-wrap">
            {grades.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setFormData({ ...formData, hrGrade: grade })}
                disabled={isLoading}
                className="ab-text-body-m ab-rounded-md"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: formData.hrGrade === grade ? '#1976d2' : 'white',
                  color: formData.hrGrade === grade ? 'white' : '#333',
                  cursor: 'pointer',
                }}
              >
                {gradeLabels[grade]}
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
