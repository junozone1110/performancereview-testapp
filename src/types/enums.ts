// SQLite does not support native enums, so we define them as TypeScript types
// These match the valid values in the database

export type Role = 'employee' | 'manager' | 'hr';

export type Half = 'first' | 'second';

export type Phase =
  | 'goal_setting'
  | 'goal_review'
  | 'self_evaluation'
  | 'self_confirmed'
  | 'manager_evaluation'
  | 'manager_confirmed'
  | 'hr_evaluation'
  | 'finalized';

export type PerformanceRating = 'SS' | 'S' | 'A' | 'B' | 'C';

export type CompetencyRating =
  | 'LEVEL_2_0'
  | 'LEVEL_2_5'
  | 'LEVEL_3_0_MINUS'
  | 'LEVEL_3_0'
  | 'LEVEL_3_5'
  | 'LEVEL_4_0';

export type Grade = 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7';

export type Treatment = 'raise' | 'maintain' | 'reduce';

// Constants for validation and display
export const ROLES: readonly Role[] = ['employee', 'manager', 'hr'] as const;
export const HALVES: readonly Half[] = ['first', 'second'] as const;
export const PHASES: readonly Phase[] = [
  'goal_setting',
  'goal_review',
  'self_evaluation',
  'self_confirmed',
  'manager_evaluation',
  'manager_confirmed',
  'hr_evaluation',
  'finalized',
] as const;
export const PERFORMANCE_RATINGS: readonly PerformanceRating[] = ['SS', 'S', 'A', 'B', 'C'] as const;
export const COMPETENCY_RATINGS: readonly CompetencyRating[] = [
  'LEVEL_2_0',
  'LEVEL_2_5',
  'LEVEL_3_0_MINUS',
  'LEVEL_3_0',
  'LEVEL_3_5',
  'LEVEL_4_0',
] as const;
export const GRADES: readonly Grade[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'] as const;
export const TREATMENTS: readonly Treatment[] = ['raise', 'maintain', 'reduce'] as const;

// Phase order for workflow validation
export const PHASE_ORDER: Record<Phase, number> = {
  goal_setting: 0,
  goal_review: 1,
  self_evaluation: 2,
  self_confirmed: 3,
  manager_evaluation: 4,
  manager_confirmed: 5,
  hr_evaluation: 6,
  finalized: 7,
};
