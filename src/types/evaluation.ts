import {
  Phase,
  PerformanceRating,
  CompetencyRating,
  Grade,
  Treatment,
  Half,
} from '@prisma/client';

// 評価ランクの数値マッピング
export const performanceRatingValues: Record<PerformanceRating, number> = {
  SS: 5,
  S: 4,
  A: 3,
  B: 2,
  C: 1,
};

// 評価ランクのラベル
export const performanceRatingLabels: Record<PerformanceRating, string> = {
  SS: 'SS (5)',
  S: 'S (4)',
  A: 'A (3)',
  B: 'B (2)',
  C: 'C (1)',
};

// コンピテンシーレベルのラベル
export const competencyRatingLabels: Record<CompetencyRating, string> = {
  LEVEL_2_0: '2.0',
  LEVEL_2_5: '2.5',
  LEVEL_3_0_MINUS: '3.0-',
  LEVEL_3_0: '3.0',
  LEVEL_3_5: '3.5',
  LEVEL_4_0: '4.0',
};

// 等級のラベル
export const gradeLabels: Record<Grade, string> = {
  G1: 'G1',
  G2: 'G2',
  G3: 'G3',
  G4: 'G4',
  G5: 'G5',
  G6: 'G6',
  G7: 'G7',
};

// 処置のラベル
export const treatmentLabels: Record<Treatment, string> = {
  raise: '昇給',
  maintain: '現状維持',
  reduce: '降給',
};

// 期のラベル
export const halfLabels: Record<Half, string> = {
  first: '上期',
  second: '下期',
};

// 目標の自己評価
export interface GoalSelfEvaluation {
  id: string;
  goalId: string;
  performanceReflection: string | null;
  performanceRating: PerformanceRating | null;
  competencyReflection1: string | null;
  competencyReflection2: string | null;
  competencyReflection3: string | null;
  competencyRating: CompetencyRating | null;
}

// 目標の上長評価
export interface GoalManagerEvaluation {
  id: string;
  goalId: string;
  performanceComment: string | null;
  performanceRating: PerformanceRating | null;
  competencyComment: string | null;
  competencyRating: CompetencyRating | null;
}

// 目標
export interface Goal {
  id: string;
  sheetId: string;
  sortOrder: number;
  title: string;
  description: string | null;
  achievementCriteria: string | null;
  weight: number;
  selfEvaluation: GoalSelfEvaluation | null;
  managerEvaluation: GoalManagerEvaluation | null;
}

// 総評
export interface TotalEvaluation {
  id: string;
  sheetId: string;
  averageScore: number | null;
  performanceComment: string | null;
  competencyLevel: CompetencyRating | null;
  competencyLevelReason: string | null;
  mgrTreatment: Treatment | null;
  mgrSalaryChange: number | null;
  mgrTreatmentComment: string | null;
  mgrGrade: Grade | null;
  mgrGradeComment: string | null;
  hrTreatment: Treatment | null;
  hrSalaryChange: number | null;
  hrGrade: Grade | null;
}

// 評価シートの所有者情報
export interface SheetOwner {
  id: string;
  name: string;
  email: string;
  employeeNumber: string;
}

// 評価期間
export interface EvaluationPeriod {
  id: string;
  name: string;
  year: number;
  half: Half;
  startDate: Date;
  endDate: Date;
  currentPhase: Phase;
  isActive: boolean;
}

// 評価シート（詳細）
export interface EvaluationSheet {
  id: string;
  userId: string;
  periodId: string;
  status: Phase;
  user: SheetOwner;
  period: EvaluationPeriod;
  goals: Goal[];
  totalEvaluation: TotalEvaluation | null;
}

// 評価シート（一覧用）
export interface EvaluationSheetSummary {
  id: string;
  userId: string;
  periodId: string;
  status: Phase;
  user: SheetOwner;
  period: {
    id: string;
    name: string;
    year: number;
    half: Half;
    currentPhase: Phase;
  };
  goalsCount: number;
  totalWeight: number;
}

// 目標フォームの入力値
export interface GoalFormData {
  title: string;
  description: string;
  achievementCriteria: string;
  weight: number;
}

// 自己評価フォームの入力値
export interface SelfEvaluationFormData {
  performanceReflection: string;
  performanceRating: PerformanceRating | null;
  competencyReflection1: string;
  competencyReflection2: string;
  competencyReflection3: string;
  competencyRating: CompetencyRating | null;
}

// 上長評価フォームの入力値
export interface ManagerEvaluationFormData {
  performanceComment: string;
  performanceRating: PerformanceRating | null;
  competencyComment: string;
  competencyRating: CompetencyRating | null;
}

// Mgr判断フォームの入力値
export interface MgrJudgmentFormData {
  competencyLevel: CompetencyRating | null;
  competencyLevelReason: string;
  mgrTreatment: Treatment | null;
  mgrSalaryChange: number | null;
  mgrTreatmentComment: string;
  mgrGrade: Grade | null;
  mgrGradeComment: string;
}

// HR判断フォームの入力値
export interface HrJudgmentFormData {
  hrTreatment: Treatment | null;
  hrSalaryChange: number | null;
  hrGrade: Grade | null;
}

// ウェイトバリデーション結果
export interface WeightValidation {
  isValid: boolean;
  totalWeight: number;
  errors: string[];
}

// ウェイトのバリデーション
export function validateWeights(goals: { weight: number }[]): WeightValidation {
  const totalWeight = goals.reduce((sum, goal) => sum + goal.weight, 0);
  const errors: string[] = [];

  if (totalWeight !== 100) {
    errors.push(`ウェイトの合計は100%である必要があります（現在: ${totalWeight}%）`);
  }

  goals.forEach((goal, index) => {
    if (goal.weight > 40) {
      errors.push(`目標${index + 1}のウェイトは40%を超えています`);
    }
    if (goal.weight < 1) {
      errors.push(`目標${index + 1}のウェイトは1%以上である必要があります`);
    }
  });

  return {
    isValid: errors.length === 0,
    totalWeight,
    errors,
  };
}

// 平均点の計算
export function calculateAverageScore(
  goals: { weight: number; selfEvaluation: { performanceRating: PerformanceRating | null } | null }[]
): number | null {
  const goalsWithRating = goals.filter(
    (g) => g.selfEvaluation?.performanceRating != null
  );

  if (goalsWithRating.length === 0) return null;

  const totalWeightedScore = goalsWithRating.reduce((sum, goal) => {
    const rating = goal.selfEvaluation!.performanceRating!;
    const value = performanceRatingValues[rating];
    return sum + value * goal.weight;
  }, 0);

  const totalWeight = goalsWithRating.reduce((sum, goal) => sum + goal.weight, 0);

  return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) / 100 : null;
}
