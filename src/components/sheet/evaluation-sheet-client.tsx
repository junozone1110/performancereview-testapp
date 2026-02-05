'use client';

import { useState } from 'react';
import { Button } from '@giftee/abukuma-react';
import {
  GoalCard,
  GoalForm,
  GoalFormOverlay,
  SelfEvaluationForm,
  ManagerEvaluationForm,
  TotalEvaluationSection,
  MgrJudgmentForm,
  HrJudgmentForm,
  WeightIndicator,
} from '@/components/sheet';
import type {
  EvaluationSheet,
  Goal,
  GoalFormData,
  SelfEvaluationFormData,
  ManagerEvaluationFormData,
  MgrJudgmentFormData,
  HrJudgmentFormData,
} from '@/types/evaluation';
import { validateWeights, calculateAverageScore, halfLabels } from '@/types/evaluation';
import { phaseLabels } from '@/lib/workflow';
import type { Role } from '@prisma/client';

interface EditPermissions {
  canEditGoals: boolean;
  canEditSelfEvaluation: boolean;
  canEditManagerEvaluation: boolean;
  canEditHrEvaluation: boolean;
}

interface EvaluationSheetClientProps {
  sheet: EvaluationSheet;
  editPermissions: EditPermissions;
  userRoles: Role[];
  isOwner: boolean;
  isManager: boolean;
}

type ModalState =
  | { type: 'none' }
  | { type: 'goalForm'; goal: Goal | null }
  | { type: 'selfEvaluation'; goal: Goal }
  | { type: 'managerEvaluation'; goal: Goal }
  | { type: 'mgrJudgment' }
  | { type: 'hrJudgment' }
  | { type: 'deleteConfirm'; goalId: string };

export function EvaluationSheetClient({
  sheet: initialSheet,
  editPermissions,
  userRoles,
  isOwner,
  isManager,
}: EvaluationSheetClientProps) {
  const [sheet, setSheet] = useState(initialSheet);
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [isLoading, setIsLoading] = useState(false);

  const weightValidation = validateWeights(sheet.goals);
  const averageScore = calculateAverageScore(sheet.goals);

  // 上長評価の表示権限（従業員本人には非表示）
  const showManagerEvaluation = !isOwner || userRoles.includes('hr') || userRoles.includes('manager');

  // Mgr判断の表示権限（従業員本人には非表示、管理職とHRには表示）
  const showMgrJudgment = userRoles.includes('hr') || (userRoles.includes('manager') && !isOwner);

  // HR判断の表示権限（HRと管理職には表示、従業員本人には非表示）
  const showHrJudgment = userRoles.includes('hr') || (userRoles.includes('manager') && !isOwner);

  // 目標追加・編集
  const handleGoalSubmit = async (data: GoalFormData) => {
    setIsLoading(true);
    try {
      const editingGoal = modalState.type === 'goalForm' ? modalState.goal : null;

      if (editingGoal) {
        // 更新
        const updatedGoals = sheet.goals.map((g) =>
          g.id === editingGoal.id
            ? { ...g, ...data }
            : g
        );
        setSheet({ ...sheet, goals: updatedGoals });
      } else {
        // 新規追加
        const newGoal: Goal = {
          id: `temp-${Date.now()}`,
          sheetId: sheet.id,
          sortOrder: sheet.goals.length + 1,
          title: data.title,
          description: data.description || null,
          achievementCriteria: data.achievementCriteria || null,
          weight: data.weight,
          selfEvaluation: null,
          managerEvaluation: null,
        };
        setSheet({ ...sheet, goals: [...sheet.goals, newGoal] });
      }
      setModalState({ type: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  // 目標削除
  const handleGoalDelete = async (goalId: string) => {
    setIsLoading(true);
    try {
      const updatedGoals = sheet.goals
        .filter((g) => g.id !== goalId)
        .map((g, index) => ({ ...g, sortOrder: index + 1 }));
      setSheet({ ...sheet, goals: updatedGoals });
      setModalState({ type: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  // 自己評価保存
  const handleSelfEvaluationSubmit = async (goalId: string, data: SelfEvaluationFormData) => {
    setIsLoading(true);
    try {
      const updatedGoals = sheet.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              selfEvaluation: {
                id: g.selfEvaluation?.id || `temp-self-${Date.now()}`,
                goalId,
                ...data,
              },
            }
          : g
      );
      setSheet({ ...sheet, goals: updatedGoals });
      setModalState({ type: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  // 上長評価保存
  const handleManagerEvaluationSubmit = async (
    goalId: string,
    data: ManagerEvaluationFormData
  ) => {
    setIsLoading(true);
    try {
      const updatedGoals = sheet.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              managerEvaluation: {
                id: g.managerEvaluation?.id || `temp-mgr-${Date.now()}`,
                goalId,
                ...data,
              },
            }
          : g
      );
      setSheet({ ...sheet, goals: updatedGoals });
      setModalState({ type: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  // Mgr判断保存
  const handleMgrJudgmentSubmit = async (data: MgrJudgmentFormData) => {
    setIsLoading(true);
    try {
      setSheet({
        ...sheet,
        totalEvaluation: {
          id: sheet.totalEvaluation?.id || `temp-total-${Date.now()}`,
          sheetId: sheet.id,
          averageScore: averageScore,
          performanceComment: sheet.totalEvaluation?.performanceComment || null,
          competencyLevel: data.competencyLevel,
          competencyLevelReason: data.competencyLevelReason || null,
          mgrTreatment: data.mgrTreatment,
          mgrSalaryChange: data.mgrSalaryChange,
          mgrTreatmentComment: data.mgrTreatmentComment || null,
          mgrGrade: data.mgrGrade,
          mgrGradeComment: data.mgrGradeComment || null,
          hrTreatment: sheet.totalEvaluation?.hrTreatment || null,
          hrSalaryChange: sheet.totalEvaluation?.hrSalaryChange || null,
          hrGrade: sheet.totalEvaluation?.hrGrade || null,
        },
      });
      setModalState({ type: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  // HR判断保存
  const handleHrJudgmentSubmit = async (data: HrJudgmentFormData) => {
    setIsLoading(true);
    try {
      setSheet({
        ...sheet,
        totalEvaluation: {
          ...sheet.totalEvaluation!,
          hrTreatment: data.hrTreatment,
          hrSalaryChange: data.hrSalaryChange,
          hrGrade: data.hrGrade,
        },
      });
      setModalState({ type: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ab-flex ab-flex-column ab-gap-6">
      {/* ヘッダー情報 */}
      <div>
        <div className="ab-flex ab-items-center ab-gap-4 ab-mb-2">
          <h1 className="ab-text-heading-l ab-text-default">評価シート</h1>
          <span
            className="ab-text-body-s ab-text-on-primary ab-rounded-md"
            style={{ backgroundColor: '#1976d2', padding: '4px 12px' }}
          >
            {phaseLabels[sheet.status]}
          </span>
        </div>
        <p className="ab-text-body-m ab-text-secondary">
          {sheet.user.name} / {sheet.period.year}年 {halfLabels[sheet.period.half]}（
          {sheet.period.name}）
        </p>
      </div>

      {/* ウェイトインジケーター */}
      {sheet.goals.length > 0 && <WeightIndicator validation={weightValidation} />}

      {/* 目標一覧 */}
      <div>
        <div className="ab-flex ab-items-center ab-justify-between ab-mb-4">
          <h2 className="ab-text-heading-m ab-text-default">
            目標一覧（{sheet.goals.length}/6）
          </h2>
          {editPermissions.canEditGoals && sheet.goals.length < 6 && (
            <Button
              variant="default"
              onClick={() => setModalState({ type: 'goalForm', goal: null })}
            >
              目標を追加
            </Button>
          )}
        </div>

        {sheet.goals.length === 0 ? (
          <div
            className="ab-bg-base ab-rounded-md ab-p-8 ab-text-center"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <p className="ab-text-body-m ab-text-secondary ab-mb-4">
              まだ目標が登録されていません
            </p>
            {editPermissions.canEditGoals && (
              <Button
                variant="default"
                onClick={() => setModalState({ type: 'goalForm', goal: null })}
              >
                最初の目標を追加
              </Button>
            )}
          </div>
        ) : (
          <div className="ab-flex ab-flex-column ab-gap-4">
            {sheet.goals
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((goal, index) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  index={index}
                  canEditGoal={editPermissions.canEditGoals}
                  canEditSelfEvaluation={editPermissions.canEditSelfEvaluation}
                  canEditManagerEvaluation={editPermissions.canEditManagerEvaluation}
                  showManagerEvaluation={showManagerEvaluation}
                  onEdit={(g) => setModalState({ type: 'goalForm', goal: g })}
                  onDelete={(id) => setModalState({ type: 'deleteConfirm', goalId: id })}
                  onEditSelfEvaluation={(g) =>
                    setModalState({ type: 'selfEvaluation', goal: g })
                  }
                  onEditManagerEvaluation={(g) =>
                    setModalState({ type: 'managerEvaluation', goal: g })
                  }
                />
              ))}
          </div>
        )}
      </div>

      {/* 総評セクション */}
      <TotalEvaluationSection
        totalEvaluation={sheet.totalEvaluation}
        averageScore={averageScore}
        canEditMgrJudgment={editPermissions.canEditManagerEvaluation}
        canEditHrJudgment={editPermissions.canEditHrEvaluation}
        showMgrJudgment={showMgrJudgment}
        showHrJudgment={showHrJudgment}
        onEditMgrJudgment={() => setModalState({ type: 'mgrJudgment' })}
        onEditHrJudgment={() => setModalState({ type: 'hrJudgment' })}
      />

      {/* モーダル */}
      {modalState.type !== 'none' && (
        <GoalFormOverlay onClose={() => setModalState({ type: 'none' })} />
      )}

      {modalState.type === 'goalForm' && (
        <GoalForm
          goal={modalState.goal}
          onSubmit={handleGoalSubmit}
          onCancel={() => setModalState({ type: 'none' })}
          isLoading={isLoading}
        />
      )}

      {modalState.type === 'selfEvaluation' && (
        <SelfEvaluationForm
          goal={modalState.goal}
          onSubmit={handleSelfEvaluationSubmit}
          onCancel={() => setModalState({ type: 'none' })}
          isLoading={isLoading}
        />
      )}

      {modalState.type === 'managerEvaluation' && (
        <ManagerEvaluationForm
          goal={modalState.goal}
          onSubmit={handleManagerEvaluationSubmit}
          onCancel={() => setModalState({ type: 'none' })}
          isLoading={isLoading}
        />
      )}

      {modalState.type === 'mgrJudgment' && (
        <MgrJudgmentForm
          totalEvaluation={sheet.totalEvaluation}
          onSubmit={handleMgrJudgmentSubmit}
          onCancel={() => setModalState({ type: 'none' })}
          isLoading={isLoading}
        />
      )}

      {modalState.type === 'hrJudgment' && (
        <HrJudgmentForm
          totalEvaluation={sheet.totalEvaluation}
          onSubmit={handleHrJudgmentSubmit}
          onCancel={() => setModalState({ type: 'none' })}
          isLoading={isLoading}
        />
      )}

      {modalState.type === 'deleteConfirm' && (
        <div
          className="ab-bg-base ab-rounded-md ab-p-6"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          <h2 className="ab-text-heading-m ab-text-default ab-mb-2">目標の削除</h2>
          <p className="ab-text-body-m ab-text-secondary ab-mb-4">
            この目標を削除してもよろしいですか？この操作は取り消せません。
          </p>
          <div className="ab-flex ab-gap-2 ab-justify-end">
            <Button
              variant="outlined"
              onClick={() => setModalState({ type: 'none' })}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              variant="negative"
              onClick={() => handleGoalDelete(modalState.goalId)}
              disabled={isLoading}
            >
              {isLoading ? '削除中...' : '削除'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
