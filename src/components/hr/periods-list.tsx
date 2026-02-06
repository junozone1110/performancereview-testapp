'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Textfield, Select } from '@giftee/abukuma-react';
import { periodsApi, type Period, ApiError } from '@/lib/api-client';
import { phaseLabels, phaseOrder } from '@/lib/workflow';
import { halfLabels } from '@/types/evaluation';
import type { Phase, Half } from '@/types/enums';

export function PeriodsList() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  // 新規作成フォーム
  const [newPeriod, setNewPeriod] = useState({
    name: '',
    year: new Date().getFullYear(),
    half: 'first' as 'first' | 'second',
    startDate: '',
    endDate: '',
  });

  const fetchPeriods = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await periodsApi.list();
      setPeriods(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('評価期間の取得に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriod.name || !newPeriod.startDate || !newPeriod.endDate) {
      setError('すべての項目を入力してください');
      return;
    }

    try {
      setCreating(true);
      await periodsApi.create(newPeriod);
      setShowCreateForm(false);
      setNewPeriod({
        name: '',
        year: new Date().getFullYear(),
        half: 'first',
        startDate: '',
        endDate: '',
      });
      await fetchPeriods();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('評価期間の作成に失敗しました');
      }
    } finally {
      setCreating(false);
    }
  };

  const handlePhaseChange = async (periodId: string, newPhase: Phase) => {
    try {
      setUpdating(periodId);
      await periodsApi.update(periodId, { currentPhase: newPhase });
      await fetchPeriods();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('フェーズの更新に失敗しました');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleActive = async (periodId: string, isActive: boolean) => {
    try {
      setUpdating(periodId);
      await periodsApi.update(periodId, { isActive });
      await fetchPeriods();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('アクティブ状態の更新に失敗しました');
      }
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div
        className="ab-bg-base ab-rounded-md ab-p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <p className="ab-text-body-m ab-text-secondary">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="ab-flex ab-flex-column ab-gap-6">
      {/* エラー表示 */}
      {error && (
        <div
          className="ab-rounded-md ab-p-4"
          style={{ backgroundColor: '#ffebee', border: '1px solid #f44336' }}
        >
          <p className="ab-text-body-m" style={{ color: '#f44336' }}>
            {error}
          </p>
          <Button
            variant="outlined"
            onClick={() => setError(null)}
            style={{ marginTop: '8px' }}
          >
            閉じる
          </Button>
        </div>
      )}

      {/* 新規作成ボタン */}
      {!showCreateForm && (
        <div>
          <Button variant="default" onClick={() => setShowCreateForm(true)}>
            新規評価期間を作成
          </Button>
        </div>
      )}

      {/* 新規作成フォーム */}
      {showCreateForm && (
        <div
          className="ab-bg-base ab-rounded-md ab-p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <h2 className="ab-text-heading-m ab-text-default ab-mb-4">
            新規評価期間の作成
          </h2>
          <form onSubmit={handleCreate} className="ab-flex ab-flex-column ab-gap-4">
            <Textfield
              label="期間名"
              placeholder="例: 2026年度上期"
              value={newPeriod.name}
              onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
              required
            />
            <div className="ab-flex ab-gap-4">
              <div style={{ flex: 1 }}>
                <Textfield
                  label="年度"
                  type="number"
                  value={newPeriod.year.toString()}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, year: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <Select
                  label="半期"
                  value={newPeriod.half}
                  options={[
                    { value: 'first', label: '上期' },
                    { value: 'second', label: '下期' },
                  ]}
                  onChange={(e) =>
                    setNewPeriod({
                      ...newPeriod,
                      half: e.target.value as 'first' | 'second',
                    })
                  }
                />
              </div>
            </div>
            <div className="ab-flex ab-gap-4">
              <div style={{ flex: 1 }}>
                <Textfield
                  label="開始日"
                  type="date"
                  value={newPeriod.startDate}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <Textfield
                  label="終了日"
                  type="date"
                  value={newPeriod.endDate}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="ab-flex ab-gap-2">
              <Button type="submit" variant="default" disabled={creating}>
                {creating ? '作成中...' : '作成'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 評価期間一覧 */}
      <div
        className="ab-bg-base ab-rounded-md ab-p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <h2 className="ab-text-heading-m ab-text-default ab-mb-1">評価期間一覧</h2>
        <p className="ab-text-body-s ab-text-secondary ab-mb-4">
          {periods.length}件の評価期間
        </p>

        {periods.length === 0 ? (
          <p className="ab-text-body-m ab-text-secondary">
            評価期間がまだ作成されていません
          </p>
        ) : (
          <div className="ab-flex ab-flex-column ab-gap-4">
            {periods.map((period) => (
              <div
                key={period.id}
                className="ab-p-4 ab-rounded-md"
                style={{
                  backgroundColor: period.isActive ? '#e3f2fd' : '#f5f5f5',
                  border: period.isActive ? '2px solid #1976d2' : '1px solid #e0e0e0',
                }}
              >
                <div className="ab-flex ab-items-start ab-justify-between ab-mb-3">
                  <div>
                    <div className="ab-flex ab-items-center ab-gap-2 ab-mb-1">
                      <span className="ab-text-heading-s ab-text-default">
                        {period.name}
                      </span>
                      {period.isActive && (
                        <span
                          className="ab-text-body-s ab-rounded-md"
                          style={{
                            backgroundColor: '#1976d2',
                            color: 'white',
                            padding: '2px 8px',
                          }}
                        >
                          アクティブ
                        </span>
                      )}
                    </div>
                    <p className="ab-text-body-s ab-text-secondary">
                      {period.year}年 {halfLabels[period.half as Half]} |{' '}
                      {new Date(period.startDate).toLocaleDateString()} 〜{' '}
                      {new Date(period.endDate).toLocaleDateString()} | シート数:{' '}
                      {period.sheetsCount}
                    </p>
                  </div>
                  <Button
                    variant={period.isActive ? 'outlined' : 'default'}
                    onClick={() => handleToggleActive(period.id, !period.isActive)}
                    disabled={updating === period.id}
                  >
                    {period.isActive ? '非アクティブ化' : 'アクティブ化'}
                  </Button>
                </div>

                <div className="ab-flex ab-items-center ab-gap-4">
                  <span className="ab-text-body-s ab-text-secondary">
                    現在のフェーズ:
                  </span>
                  <Select
                    value={period.currentPhase}
                    options={phaseOrder.map((phase) => ({
                      value: phase,
                      label: phaseLabels[phase],
                    }))}
                    onChange={(e) =>
                      handlePhaseChange(period.id, e.target.value as Phase)
                    }
                    disabled={updating === period.id}
                    style={{ minWidth: '200px' }}
                  />
                  {updating === period.id && (
                    <span className="ab-text-body-s ab-text-secondary">
                      更新中...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
