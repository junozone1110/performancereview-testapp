// API client utility for making fetch requests

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function fetchApi<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Add query parameters if provided
  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams(params);
    fullUrl = `${url}?${searchParams.toString()}`;
  }

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.error || 'リクエストに失敗しました');
  }

  return response.json();
}

// Sheet API
export const sheetsApi = {
  list: (periodId?: string) =>
    fetchApi<SheetSummary[]>('/api/sheets', {
      params: periodId ? { periodId } : undefined,
    }),

  get: (sheetId: string) => fetchApi<SheetDetail>(`/api/sheets/${sheetId}`),

  updateStatus: (sheetId: string, status: string) =>
    fetchApi(`/api/sheets/${sheetId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Goals API
export const goalsApi = {
  create: (sheetId: string, data: GoalCreateData) =>
    fetchApi<Goal>(`/api/sheets/${sheetId}/goals`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (goalId: string, data: GoalUpdateData) =>
    fetchApi<Goal>(`/api/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (goalId: string) =>
    fetchApi<{ success: boolean }>(`/api/goals/${goalId}`, {
      method: 'DELETE',
    }),

  updateSelfEvaluation: (goalId: string, data: SelfEvaluationData) =>
    fetchApi(`/api/goals/${goalId}/self-evaluation`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateManagerEvaluation: (goalId: string, data: ManagerEvaluationData) =>
    fetchApi(`/api/goals/${goalId}/manager-evaluation`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Total Evaluation API
export const totalEvaluationApi = {
  update: (sheetId: string, data: TotalEvaluationData) =>
    fetchApi(`/api/sheets/${sheetId}/total-evaluation`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Types for API responses and requests
export interface SheetSummary {
  id: string;
  userId: string;
  periodId: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    employeeNumber: string;
  };
  period: {
    id: string;
    name: string;
    year: number;
    half: string;
    currentPhase: string;
  };
  goalsCount: number;
  totalWeight: number;
  isOwner: boolean;
}

export interface SheetDetail {
  id: string;
  userId: string;
  periodId: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    employeeNumber: string;
  };
  period: {
    id: string;
    name: string;
    year: number;
    half: string;
    startDate: string;
    endDate: string;
    currentPhase: string;
    isActive: boolean;
  };
  goals: Goal[];
  totalEvaluation: TotalEvaluation | null;
  editPermissions: {
    canEditGoals: boolean;
    canEditSelfEvaluation: boolean;
    canEditManagerEvaluation: boolean;
    canEditHrEvaluation: boolean;
  };
  isOwner: boolean;
  isManager: boolean;
}

export interface Goal {
  id: string;
  sheetId: string;
  sortOrder: number;
  title: string;
  description: string | null;
  achievementCriteria: string | null;
  weight: number;
  selfEvaluation: SelfEvaluation | null;
  managerEvaluation: ManagerEvaluation | null;
}

export interface SelfEvaluation {
  id: string;
  goalId: string;
  performanceReflection: string | null;
  performanceRating: string | null;
  competencyReflection1: string | null;
  competencyReflection2: string | null;
  competencyReflection3: string | null;
  competencyRating: string | null;
}

export interface ManagerEvaluation {
  id: string;
  goalId: string;
  performanceComment: string | null;
  performanceRating: string | null;
  competencyComment: string | null;
  competencyRating: string | null;
}

export interface TotalEvaluation {
  id: string;
  sheetId: string;
  averageScore: number | null;
  performanceComment: string | null;
  competencyLevel: string | null;
  competencyLevelReason: string | null;
  mgrTreatment: string | null;
  mgrSalaryChange: number | null;
  mgrTreatmentComment: string | null;
  mgrGrade: string | null;
  mgrGradeComment: string | null;
  hrTreatment: string | null;
  hrSalaryChange: number | null;
  hrGrade: string | null;
}

export interface GoalCreateData {
  title: string;
  description?: string;
  achievementCriteria?: string;
  weight: number;
}

export interface GoalUpdateData {
  title?: string;
  description?: string;
  achievementCriteria?: string;
  weight?: number;
  sortOrder?: number;
}

export interface SelfEvaluationData {
  performanceReflection?: string;
  performanceRating?: string | null;
  competencyReflection1?: string;
  competencyReflection2?: string;
  competencyReflection3?: string;
  competencyRating?: string | null;
}

export interface ManagerEvaluationData {
  performanceComment?: string;
  performanceRating?: string | null;
  competencyComment?: string;
  competencyRating?: string | null;
}

export interface TotalEvaluationData {
  competencyLevel?: string | null;
  competencyLevelReason?: string;
  mgrTreatment?: string | null;
  mgrSalaryChange?: number | null;
  mgrTreatmentComment?: string;
  mgrGrade?: string | null;
  mgrGradeComment?: string;
  hrTreatment?: string | null;
  hrSalaryChange?: number | null;
  hrGrade?: string | null;
}
