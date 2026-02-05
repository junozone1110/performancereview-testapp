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
  GoalFormData,
  SelfEvaluationFormData,
  ManagerEvaluationFormData,
  MgrJudgmentFormData,
  HrJudgmentFormData,
} from '@/types/evaluation';
import { validateWeights, calculateAverageScore, halfLabels } from '@/types/evaluation';
import { phaseLabels } from '@/lib/workflow';
import type {
  SheetDetail,
  Goal,
  GoalCreateData,
  GoalUpdateData,
  SelfEvaluationData,
  ManagerEvaluationData,
  TotalEvaluationData,
} from '@/lib/api-client';
import type { Phase, Half, Role, PerformanceRating, CompetencyRating } from '@prisma/client';

interface EvaluationSheetViewProps {
  sheet: SheetDetail;
  isLoading: boolean;
  error: string | null;
  onAddGoal: (data: GoalCreateData) => Promise<Goal | null>;
  onUpdateGoal: (goalId: string, data: GoalUpdateData) => Promise<Goal | null>;
  onDeleteGoal: (goalId: string) => Promise<boolean>;
  onUpdateSelfEvaluation: (goalId: string, data: SelfEvaluationData) => Promise<boolean>;
  onUpdateManagerEvaluation: (goalId: string, data: ManagerEvaluationData) => Promise<boolean>;
  onUpdateTotalEvaluation: (data: TotalEvaluationData) => Promise<boolean>;
}

type ModalState =
  | { type: 'none' }
  | { type: 'goalForm'; goal: Goal | null }
  | { type: 'selfEvaluation'; goal: Goal }
  | { type: 'managerEvaluation'; goal: Goal }
  | { type: 'mgrJudgment' }
  | { type: 'hrJudgment' }
  | { type: 'deleteConfirm'; goalId: string };

// Convert API types to component types
function convertGoalForCard(goal: Goal) {
  return {
    ...goal,
    selfEvaluation: goal.selfEvaluation
      ? {
          ...goal.selfEvaluation,
          performanceRating: goal.selfEvaluation.performanceRating as PerformanceRating | null,
          competencyRating: goal.selfEvaluation.competencyRating as CompetencyRating | null,
        }
      : null,
    managerEvaluation: goal.managerEvaluation
      ? {
          ...goal.managerEvaluation,
          performanceRating: goal.managerEvaluation.performanceRating as PerformanceRating | null,
          competencyRating: goal.managerEvaluation.competencyRating as CompetencyRating | null,
        }
      : null,
  };
}

export function EvaluationSheetView({
  sheet,
  isLoading,
  error,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onUpdateSelfEvaluation,
  onUpdateManagerEvaluation,
  onUpdateTotalEvaluation,
}: EvaluationSheetViewProps) {
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [actionLoading, setActionLoading] = useState(false);

  const editPermissions = sheet.editPermissions;
  const userRoles: Role[] = sheet.isOwner ? ['employee'] : sheet.isManager ? ['manager'] : ['hr'];

  // Calculate weight validation
  const weightValidation = validateWeights(sheet.goals);

  // Calculate average score
  const goalsForScore = sheet.goals.map((g) => ({
    weight: g.weight,
    selfEvaluation: g.selfEvaluation
      ? { performanceRating: g.selfEvaluation.performanceRating as PerformanceRating | null }
      : null,
  }));
  const averageScore = calculateAverageScore(goalsForScore);

  // Permission checks for visibility
  const showManagerEvaluation = !sheet.isOwner || sheet.isManager;
  const showMgrJudgment = !sheet.isOwner;
  const showHrJudgment = !sheet.isOwner;

  // Goal handlers
  const handleGoalSubmit = async (data: GoalFormData) => {
    setActionLoading(true);
    try {
      const editingGoal = modalState.type === 'goalForm' ? modalState.goal : null;

      if (editingGoal) {
        await onUpdateGoal(editingGoal.id, {
          title: data.title,
          description: data.description || undefined,
          achievementCriteria: data.achievementCriteria || undefined,
          weight: data.weight,
        });
      } else {
        await onAddGoal({
          title: data.title,
          description: data.description || undefined,
          achievementCriteria: data.achievementCriteria || undefined,
          weight: data.weight,
        });
      }
      setModalState({ type: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGoalDelete = async (goalId: string) => {
    setActionLoading(true);
    try {
      await onDeleteGoal(goalId);
      setModalState({ type: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelfEvaluationSubmit = async (goalId: string, data: SelfEvaluationFormData) => {
    setActionLoading(true);
    try {
      await onUpdateSelfEvaluation(goalId, {
        performanceReflection: data.performanceReflection || undefined,
        performanceRating: data.performanceRating || undefined,
        competencyReflection1: data.competencyReflection1 || undefined,
        competencyReflection2: data.competencyReflection2 || undefined,
        competencyReflection3: data.competencyReflection3 || undefined,
        competencyRating: data.competencyRating || undefined,
      });
      setModalState({ type: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagerEvaluationSubmit = async (
    goalId: string,
    data: ManagerEvaluationFormData
  ) => {
    setActionLoading(true);
    try {
      await onUpdateManagerEvaluation(goalId, {
        performanceComment: data.performanceComment || undefined,
        performanceRating: data.performanceRating || undefined,
        competencyComment: data.competencyComment || undefined,
        competencyRating: data.competencyRating || undefined,
      });
      setModalState({ type: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMgrJudgmentSubmit = async (data: MgrJudgmentFormData) => {
    setActionLoading(true);
    try {
      await onUpdateTotalEvaluation({
        competencyLevel: data.competencyLevel || undefined,
        competencyLevelReason: data.competencyLevelReason || undefined,
        mgrTreatment: data.mgrTreatment || undefined,
        mgrSalaryChange: data.mgrSalaryChange ?? undefined,
        mgrTreatmentComment: data.mgrTreatmentComment || undefined,
        mgrGrade: data.mgrGrade || undefined,
        mgrGradeComment: data.mgrGradeComment || undefined,
      });
      setModalState({ type: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleHrJudgmentSubmit = async (data: HrJudgmentFormData) => {
    setActionLoading(true);
    try {
      await onUpdateTotalEvaluation({
        hrTreatment: data.hrTreatment || undefined,
        hrSalaryChange: data.hrSalaryChange ?? undefined,
        hrGrade: data.hrGrade || undefined,
      });
      setModalState({ type: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const totalEvaluationForDisplay = sheet.totalEvaluation
    ? {
        ...sheet.totalEvaluation,
        averageScore: sheet.totalEvaluation.averageScore,
        competencyLevel: sheet.totalEvaluation.competencyLevel as CompetencyRating | null,
        mgrTreatment: sheet.totalEvaluation.mgrTreatment as 'raise' | 'maintain' | 'reduce' | null,
        mgrGrade: sheet.totalEvaluation.mgrGrade as 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7' | null,
        hrTreatment: sheet.totalEvaluation.hrTreatment as 'raise' | 'maintain' | 'reduce' | null,
        hrGrade: sheet.totalEvaluation.hrGrade as 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7' | null,
      }
    : null;

  return (
    <div className="ab-flex ab-flex-column ab-gap-6">
      {/* Error display */}
      {error && (
        <div
          className="ab-rounded-md ab-p-4"
          style={{ backgroundColor: '#ffebee', border: '1px solid #f44336' }}
        >
          <p className="ab-text-body-m" style={{ color: '#f44336' }}>{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="ab-flex ab-items-center ab-gap-4 ab-mb-2">
          <h1 className="ab-text-heading-l ab-text-default">評価シート</h1>
          <span
            className="ab-text-body-s ab-text-on-primary ab-rounded-md"
            style={{ backgroundColor: '#1976d2', padding: '4px 12px' }}
          >
            {phaseLabels[sheet.status as Phase]}
          </span>
          {(isLoading || actionLoading) && (
            <span className="ab-text-body-s ab-text-secondary">保存中...</span>
          )}
        </div>
        <p className="ab-text-body-m ab-text-secondary">
          {sheet.user.name} / {sheet.period.year}年 {halfLabels[sheet.period.half as Half]}（
          {sheet.period.name}）
        </p>
      </div>

      {/* Weight Indicator */}
      {sheet.goals.length > 0 && <WeightIndicator validation={weightValidation} />}

      {/* Goals List */}
      <div>
        <div className="ab-flex ab-items-center ab-justify-between ab-mb-4">
          <h2 className="ab-text-heading-m ab-text-default">
            目標一覧（{sheet.goals.length}/6）
          </h2>
          {editPermissions.canEditGoals && sheet.goals.length < 6 && (
            <Button
              variant="default"
              onClick={() => setModalState({ type: 'goalForm', goal: null })}
              disabled={isLoading || actionLoading}
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
                disabled={isLoading || actionLoading}
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
                  goal={convertGoalForCard(goal)}
                  index={index}
                  canEditGoal={editPermissions.canEditGoals}
                  canEditSelfEvaluation={editPermissions.canEditSelfEvaluation}
                  canEditManagerEvaluation={editPermissions.canEditManagerEvaluation}
                  showManagerEvaluation={showManagerEvaluation}
                  onEdit={(g) => setModalState({ type: 'goalForm', goal: g as Goal })}
                  onDelete={(id) => setModalState({ type: 'deleteConfirm', goalId: id })}
                  onEditSelfEvaluation={(g) =>
                    setModalState({ type: 'selfEvaluation', goal: g as Goal })
                  }
                  onEditManagerEvaluation={(g) =>
                    setModalState({ type: 'managerEvaluation', goal: g as Goal })
                  }
                />
              ))}
          </div>
        )}
      </div>

      {/* Total Evaluation Section */}
      <TotalEvaluationSection
        totalEvaluation={totalEvaluationForDisplay}
        averageScore={averageScore}
        canEditMgrJudgment={editPermissions.canEditManagerEvaluation}
        canEditHrJudgment={editPermissions.canEditHrEvaluation}
        showMgrJudgment={showMgrJudgment}
        showHrJudgment={showHrJudgment}
        onEditMgrJudgment={() => setModalState({ type: 'mgrJudgment' })}
        onEditHrJudgment={() => setModalState({ type: 'hrJudgment' })}
      />

      {/* Modals */}
      {modalState.type !== 'none' && (
        <GoalFormOverlay onClose={() => setModalState({ type: 'none' })} />
      )}

      {modalState.type === 'goalForm' && (
        <GoalForm
          goal={modalState.goal ? convertGoalForCard(modalState.goal) : null}
          onSubmit={handleGoalSubmit}
          onCancel={() => setModalState({ type: 'none' })}
          isLoading={actionLoading}
        />
      )}

      {modalState.type === 'selfEvaluation' && (
        <SelfEvaluationForm
          goal={convertGoalForCard(modalState.goal)}
          onSubmit={handleSelfEvaluationSubmit}
          onCancel={() => setModalState({ type: 'none' })}
          isLoading={actionLoading}
        />
      )}

      {modalState.type === 'managerEvaluation' && (
        <ManagerEvaluationForm
          goal={convertGoalForCard(modalState.goal)}
          onSubmit={handleManagerEvaluationSubmit}
          onCancel={() => setModalState({ type: 'none' })}
          isLoading={actionLoading}
        />
      )}

      {modalState.type === 'mgrJudgment' && (
        <MgrJudgmentForm
          totalEvaluation={totalEvaluationForDisplay}
          onSubmit={handleMgrJudgmentSubmit}
          onCancel={() => setModalState({ type: 'none' })}
          isLoading={actionLoading}
        />
      )}

      {modalState.type === 'hrJudgment' && (
        <HrJudgmentForm
          totalEvaluation={totalEvaluationForDisplay}
          onSubmit={handleHrJudgmentSubmit}
          onCancel={() => setModalState({ type: 'none' })}
          isLoading={actionLoading}
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
              disabled={actionLoading}
            >
              キャンセル
            </Button>
            <Button
              variant="negative"
              onClick={() => handleGoalDelete(modalState.goalId)}
              disabled={actionLoading}
            >
              {actionLoading ? '削除中...' : '削除'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
