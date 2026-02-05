'use client';

import { useState } from 'react';
import { Button } from '@giftee/abukuma-react';
import type { Goal } from '@/types/evaluation';
import {
  performanceRatingLabels,
  competencyRatingLabels,
} from '@/types/evaluation';

interface GoalCardProps {
  goal: Goal;
  index: number;
  canEditGoal: boolean;
  canEditSelfEvaluation: boolean;
  canEditManagerEvaluation: boolean;
  showManagerEvaluation: boolean;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onEditSelfEvaluation?: (goal: Goal) => void;
  onEditManagerEvaluation?: (goal: Goal) => void;
}

export function GoalCard({
  goal,
  index,
  canEditGoal,
  canEditSelfEvaluation,
  canEditManagerEvaluation,
  showManagerEvaluation,
  onEdit,
  onDelete,
  onEditSelfEvaluation,
  onEditManagerEvaluation,
}: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="ab-bg-base ab-rounded-md ab-p-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      data-testid="goal-card"
    >
      {/* ヘッダー */}
      <div className="ab-flex ab-items-start ab-gap-4">
        <div
          className="ab-flex ab-items-center ab-justify-center ab-rounded-full ab-bg-rest-primary ab-text-on-primary"
          style={{ width: '32px', height: '32px', flexShrink: 0 }}
        >
          {index + 1}
        </div>

        <div style={{ flex: 1 }}>
          <div className="ab-flex ab-items-center ab-gap-2 ab-mb-1">
            <h3 className="ab-text-heading-s ab-text-default">{goal.title}</h3>
            <span
              className="ab-text-body-s ab-text-on-primary ab-rounded-md"
              style={{
                backgroundColor: '#1976d2',
                padding: '2px 8px',
              }}
            >
              {goal.weight}%
            </span>
          </div>

          {goal.description && (
            <p className="ab-text-body-s ab-text-secondary ab-mb-2">{goal.description}</p>
          )}

          {goal.achievementCriteria && (
            <div className="ab-mb-2">
              <span className="ab-text-body-s ab-text-secondary">達成基準: </span>
              <span className="ab-text-body-s ab-text-default">{goal.achievementCriteria}</span>
            </div>
          )}
        </div>

        <div className="ab-flex ab-items-center ab-gap-2">
          {canEditGoal && (
            <>
              <Button variant="outlined" size="small" onClick={() => onEdit?.(goal)}>
                編集
              </Button>
              <Button variant="outlined" size="small" onClick={() => onDelete?.(goal.id)}>
                削除
              </Button>
            </>
          )}
          <Button
            variant="text"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '閉じる' : '詳細'}
          </Button>
        </div>
      </div>

      {/* 詳細（展開時） */}
      {isExpanded && (
        <div className="ab-mt-4" style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
          {/* 自己評価セクション */}
          <div className="ab-mb-4">
            <div className="ab-flex ab-items-center ab-justify-between ab-mb-2">
              <h4 className="ab-text-heading-xs ab-text-default">自己評価</h4>
              {canEditSelfEvaluation && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onEditSelfEvaluation?.(goal)}
                >
                  {goal.selfEvaluation ? '編集' : '入力'}
                </Button>
              )}
            </div>

            {goal.selfEvaluation ? (
              <div className="ab-flex ab-flex-column ab-gap-3">
                <div>
                  <p className="ab-text-body-s ab-text-secondary ab-mb-1">成果振り返り</p>
                  <p className="ab-text-body-m ab-text-default">
                    {goal.selfEvaluation.performanceReflection || '未入力'}
                  </p>
                </div>

                <div>
                  <p className="ab-text-body-s ab-text-secondary ab-mb-1">成果評価</p>
                  <p className="ab-text-body-m ab-text-default">
                    {goal.selfEvaluation.performanceRating
                      ? performanceRatingLabels[goal.selfEvaluation.performanceRating]
                      : '未入力'}
                  </p>
                </div>

                <div>
                  <p className="ab-text-body-s ab-text-secondary ab-mb-1">
                    コンピテンシー振り返り
                  </p>
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    <li className="ab-text-body-m ab-text-default">
                      {goal.selfEvaluation.competencyReflection1 || '未入力'}
                    </li>
                    <li className="ab-text-body-m ab-text-default">
                      {goal.selfEvaluation.competencyReflection2 || '未入力'}
                    </li>
                    <li className="ab-text-body-m ab-text-default">
                      {goal.selfEvaluation.competencyReflection3 || '未入力'}
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="ab-text-body-s ab-text-secondary ab-mb-1">コンピテンシー評価</p>
                  <p className="ab-text-body-m ab-text-default">
                    {goal.selfEvaluation.competencyRating
                      ? competencyRatingLabels[goal.selfEvaluation.competencyRating]
                      : '未入力'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="ab-text-body-m ab-text-secondary">自己評価は未入力です</p>
            )}
          </div>

          {/* 上長評価セクション（表示権限がある場合のみ） */}
          {showManagerEvaluation && (
            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
              <div className="ab-flex ab-items-center ab-justify-between ab-mb-2">
                <h4 className="ab-text-heading-xs ab-text-default">上長評価</h4>
                {canEditManagerEvaluation && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onEditManagerEvaluation?.(goal)}
                  >
                    {goal.managerEvaluation ? '編集' : '入力'}
                  </Button>
                )}
              </div>

              {goal.managerEvaluation ? (
                <div className="ab-flex ab-flex-column ab-gap-3">
                  <div>
                    <p className="ab-text-body-s ab-text-secondary ab-mb-1">成果コメント</p>
                    <p className="ab-text-body-m ab-text-default">
                      {goal.managerEvaluation.performanceComment || '未入力'}
                    </p>
                  </div>

                  <div>
                    <p className="ab-text-body-s ab-text-secondary ab-mb-1">成果評価</p>
                    <p className="ab-text-body-m ab-text-default">
                      {goal.managerEvaluation.performanceRating
                        ? performanceRatingLabels[goal.managerEvaluation.performanceRating]
                        : '未入力'}
                    </p>
                  </div>

                  <div>
                    <p className="ab-text-body-s ab-text-secondary ab-mb-1">
                      コンピテンシーコメント
                    </p>
                    <p className="ab-text-body-m ab-text-default">
                      {goal.managerEvaluation.competencyComment || '未入力'}
                    </p>
                  </div>

                  <div>
                    <p className="ab-text-body-s ab-text-secondary ab-mb-1">コンピテンシー評価</p>
                    <p className="ab-text-body-m ab-text-default">
                      {goal.managerEvaluation.competencyRating
                        ? competencyRatingLabels[goal.managerEvaluation.competencyRating]
                        : '未入力'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="ab-text-body-m ab-text-secondary">上長評価は未入力です</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
