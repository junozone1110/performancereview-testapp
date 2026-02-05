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

// Team API (Manager)
export const teamApi = {
  list: (periodId?: string) =>
    fetchApi<TeamMember[]>('/api/team', {
      params: periodId ? { periodId } : undefined,
    }),
};

// Employees API (HR)
export const employeesApi = {
  list: (params?: { periodId?: string; search?: string; departmentId?: string; status?: string }) =>
    fetchApi<EmployeeSheet[]>('/api/employees', {
      params: params
        ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string>
        : undefined,
    }),
};

// Periods API (HR)
export const periodsApi = {
  list: () => fetchApi<Period[]>('/api/periods'),

  get: (periodId: string) => fetchApi<PeriodDetail>(`/api/periods/${periodId}`),

  create: (data: PeriodCreateData) =>
    fetchApi<Period>('/api/periods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (periodId: string, data: PeriodUpdateData) =>
    fetchApi<Period>(`/api/periods/${periodId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (periodId: string) =>
    fetchApi<{ success: boolean }>(`/api/periods/${periodId}`, {
      method: 'DELETE',
    }),
};

// Viewers API (HR)
export const viewersApi = {
  list: (params?: { sheetId?: string; periodId?: string }) =>
    fetchApi<AdditionalViewer[]>('/api/viewers', {
      params: params
        ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string>
        : undefined,
    }),

  create: (data: ViewerCreateData) =>
    fetchApi<AdditionalViewer>('/api/viewers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (viewerId: string) =>
    fetchApi<{ success: boolean }>(`/api/viewers/${viewerId}`, {
      method: 'DELETE',
    }),
};

// Users API (HR)
export const usersApi = {
  list: (params?: { search?: string; activeOnly?: boolean }) =>
    fetchApi<UserSummary[]>('/api/users', {
      params: params
        ? Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          ) as Record<string, string>
        : undefined,
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
  isAdditionalViewer?: boolean;
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

// Team API Types
export interface TeamMember {
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
  department: {
    id: string;
    name: string;
  } | null;
  currentGrade: string | null;
  goalsCount: number;
  totalWeight: number;
}

// Employees API Types
export interface EmployeeSheet {
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
  department: {
    id: string;
    name: string;
  } | null;
  manager: {
    id: string;
    name: string;
  } | null;
  currentGrade: string | null;
  goalsCount: number;
  totalWeight: number;
}

// Periods API Types
export interface Period {
  id: string;
  name: string;
  year: number;
  half: string;
  startDate: string;
  endDate: string;
  currentPhase: string;
  isActive: boolean;
  sheetsCount: number;
}

export interface PeriodDetail extends Period {
  phaseStats: Record<string, number>;
}

export interface PeriodCreateData {
  name: string;
  year: number;
  half: 'first' | 'second';
  startDate: string;
  endDate: string;
}

export interface PeriodUpdateData {
  currentPhase?: string;
  isActive?: boolean;
}

// Viewers API Types
export interface AdditionalViewer {
  id: string;
  sheetId: string;
  viewerUserId: string;
  createdBy: string;
  createdAt: string;
  sheet: {
    id: string;
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
    };
  };
  viewer: {
    id: string;
    name: string;
    email: string;
    employeeNumber: string;
  };
  creator: {
    id: string;
    name: string;
  };
}

export interface ViewerCreateData {
  sheetId: string;
  viewerUserId: string;
}

// Users API Types
export interface UserSummary {
  id: string;
  name: string;
  email: string;
  employeeNumber: string;
  isActive: boolean;
  roles: string[];
}
