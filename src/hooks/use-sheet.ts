'use client';

import { useState, useCallback } from 'react';
import {
  sheetsApi,
  goalsApi,
  totalEvaluationApi,
  ApiError,
  type SheetDetail,
  type Goal,
  type GoalCreateData,
  type GoalUpdateData,
  type SelfEvaluationData,
  type ManagerEvaluationData,
  type TotalEvaluationData,
} from '@/lib/api-client';

interface UseSheetReturn {
  sheet: SheetDetail | null;
  isLoading: boolean;
  error: string | null;
  fetchSheet: (sheetId: string) => Promise<void>;
  addGoal: (data: GoalCreateData) => Promise<Goal | null>;
  updateGoal: (goalId: string, data: GoalUpdateData) => Promise<Goal | null>;
  deleteGoal: (goalId: string) => Promise<boolean>;
  updateSelfEvaluation: (goalId: string, data: SelfEvaluationData) => Promise<boolean>;
  updateManagerEvaluation: (goalId: string, data: ManagerEvaluationData) => Promise<boolean>;
  updateTotalEvaluation: (data: TotalEvaluationData) => Promise<boolean>;
  updateSheetStatus: (status: string) => Promise<boolean>;
  refreshSheet: () => Promise<void>;
}

export function useSheet(): UseSheetReturn {
  const [sheet, setSheet] = useState<SheetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);

  const fetchSheet = useCallback(async (sheetId: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentSheetId(sheetId);

    try {
      const data = await sheetsApi.get(sheetId);
      setSheet(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('シートの取得に失敗しました');
      }
      setSheet(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSheet = useCallback(async () => {
    if (currentSheetId) {
      await fetchSheet(currentSheetId);
    }
  }, [currentSheetId, fetchSheet]);

  const addGoal = useCallback(
    async (data: GoalCreateData): Promise<Goal | null> => {
      if (!sheet) return null;

      setIsLoading(true);
      setError(null);

      try {
        const newGoal = await goalsApi.create(sheet.id, data);
        await refreshSheet();
        return newGoal;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('目標の追加に失敗しました');
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sheet, refreshSheet]
  );

  const updateGoal = useCallback(
    async (goalId: string, data: GoalUpdateData): Promise<Goal | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedGoal = await goalsApi.update(goalId, data);
        await refreshSheet();
        return updatedGoal;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('目標の更新に失敗しました');
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSheet]
  );

  const deleteGoal = useCallback(
    async (goalId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await goalsApi.delete(goalId);
        await refreshSheet();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('目標の削除に失敗しました');
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSheet]
  );

  const updateSelfEvaluation = useCallback(
    async (goalId: string, data: SelfEvaluationData): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await goalsApi.updateSelfEvaluation(goalId, data);
        await refreshSheet();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('自己評価の保存に失敗しました');
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSheet]
  );

  const updateManagerEvaluation = useCallback(
    async (goalId: string, data: ManagerEvaluationData): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await goalsApi.updateManagerEvaluation(goalId, data);
        await refreshSheet();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('上長評価の保存に失敗しました');
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSheet]
  );

  const updateTotalEvaluation = useCallback(
    async (data: TotalEvaluationData): Promise<boolean> => {
      if (!sheet) return false;

      setIsLoading(true);
      setError(null);

      try {
        await totalEvaluationApi.update(sheet.id, data);
        await refreshSheet();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('総評の保存に失敗しました');
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sheet, refreshSheet]
  );

  const updateSheetStatus = useCallback(
    async (status: string): Promise<boolean> => {
      if (!sheet) return false;

      setIsLoading(true);
      setError(null);

      try {
        await sheetsApi.updateStatus(sheet.id, status);
        await refreshSheet();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('ステータスの更新に失敗しました');
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sheet, refreshSheet]
  );

  return {
    sheet,
    isLoading,
    error,
    fetchSheet,
    addGoal,
    updateGoal,
    deleteGoal,
    updateSelfEvaluation,
    updateManagerEvaluation,
    updateTotalEvaluation,
    updateSheetStatus,
    refreshSheet,
  };
}
