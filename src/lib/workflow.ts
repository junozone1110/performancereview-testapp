import { Phase, Role } from '@prisma/client';

// フェーズの順序
export const phaseOrder: Phase[] = [
  'goal_setting',
  'goal_review',
  'self_evaluation',
  'self_confirmed',
  'manager_evaluation',
  'manager_confirmed',
  'hr_evaluation',
  'finalized',
];

// フェーズの日本語名
export const phaseLabels: Record<Phase, string> = {
  goal_setting: '目標入力',
  goal_review: '目標確定',
  self_evaluation: '自己評価入力',
  self_confirmed: '自己評価確定',
  manager_evaluation: '上長評価入力',
  manager_confirmed: '上長評価確定',
  hr_evaluation: 'HR判断入力',
  finalized: '最終確定',
};

// フェーズごとの編集権限
interface PhaseEditPermission {
  canEditGoals: boolean;
  canEditSelfEvaluation: boolean;
  canEditManagerEvaluation: boolean;
  canEditHrEvaluation: boolean;
}

export const phasePermissions: Record<Phase, PhaseEditPermission> = {
  goal_setting: {
    canEditGoals: true,
    canEditSelfEvaluation: false,
    canEditManagerEvaluation: false,
    canEditHrEvaluation: false,
  },
  goal_review: {
    canEditGoals: false,
    canEditSelfEvaluation: false,
    canEditManagerEvaluation: false,
    canEditHrEvaluation: false,
  },
  self_evaluation: {
    canEditGoals: false,
    canEditSelfEvaluation: true,
    canEditManagerEvaluation: false,
    canEditHrEvaluation: false,
  },
  self_confirmed: {
    canEditGoals: false,
    canEditSelfEvaluation: false,
    canEditManagerEvaluation: false,
    canEditHrEvaluation: false,
  },
  manager_evaluation: {
    canEditGoals: false,
    canEditSelfEvaluation: false,
    canEditManagerEvaluation: true,
    canEditHrEvaluation: false,
  },
  manager_confirmed: {
    canEditGoals: false,
    canEditSelfEvaluation: false,
    canEditManagerEvaluation: false,
    canEditHrEvaluation: false,
  },
  hr_evaluation: {
    canEditGoals: false,
    canEditSelfEvaluation: false,
    canEditManagerEvaluation: false,
    canEditHrEvaluation: true,
  },
  finalized: {
    canEditGoals: false,
    canEditSelfEvaluation: false,
    canEditManagerEvaluation: false,
    canEditHrEvaluation: false,
  },
};

// ユーザーがシートを編集できるか判定
export function canEditSheet(
  sheetStatus: Phase,
  periodPhase: Phase,
  userRoles: Role[],
  isOwner: boolean,
  isManager: boolean
): PhaseEditPermission {
  const periodPermission = phasePermissions[periodPhase];

  return {
    canEditGoals: periodPermission.canEditGoals && isOwner,
    canEditSelfEvaluation: periodPermission.canEditSelfEvaluation && isOwner,
    canEditManagerEvaluation:
      periodPermission.canEditManagerEvaluation && (isManager || userRoles.includes('hr')),
    canEditHrEvaluation: periodPermission.canEditHrEvaluation && userRoles.includes('hr'),
  };
}

// 次のフェーズを取得
export function getNextPhase(currentPhase: Phase): Phase | null {
  const currentIndex = phaseOrder.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === phaseOrder.length - 1) {
    return null;
  }
  return phaseOrder[currentIndex + 1];
}

// フェーズが特定のフェーズ以降かどうか判定
export function isPhaseAtOrAfter(phase: Phase, targetPhase: Phase): boolean {
  return phaseOrder.indexOf(phase) >= phaseOrder.indexOf(targetPhase);
}

// フェーズが特定のフェーズ以前かどうか判定
export function isPhaseAtOrBefore(phase: Phase, targetPhase: Phase): boolean {
  return phaseOrder.indexOf(phase) <= phaseOrder.indexOf(targetPhase);
}
