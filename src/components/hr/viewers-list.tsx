'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Textfield, Select } from '@giftee/abukuma-react';
import {
  viewersApi,
  usersApi,
  employeesApi,
  periodsApi,
  type AdditionalViewer,
  type UserSummary,
  type EmployeeSheet,
  type Period,
  ApiError,
} from '@/lib/api-client';
import { halfLabels } from '@/types/evaluation';
import type { Half } from '@prisma/client';

export function ViewersList() {
  const [viewers, setViewers] = useState<AdditionalViewer[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [sheets, setSheets] = useState<EmployeeSheet[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // フィルタ
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  // 新規追加フォーム
  const [newViewer, setNewViewer] = useState({
    sheetId: '',
    viewerUserId: '',
  });

  // ユーザー検索
  const [userSearch, setUserSearch] = useState('');

  const fetchViewers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = selectedPeriodId ? { periodId: selectedPeriodId } : undefined;
      const data = await viewersApi.list(params);
      setViewers(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('追加閲覧者の取得に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriodId]);

  const fetchPeriods = useCallback(async () => {
    try {
      const data = await periodsApi.list();
      setPeriods(data);
    } catch (err) {
      console.error('Error fetching periods:', err);
    }
  }, []);

  const fetchSheets = useCallback(async () => {
    if (!selectedPeriodId) {
      setSheets([]);
      return;
    }
    try {
      const data = await employeesApi.list({ periodId: selectedPeriodId });
      setSheets(data);
    } catch (err) {
      console.error('Error fetching sheets:', err);
    }
  }, [selectedPeriodId]);

  const fetchUsers = useCallback(async () => {
    try {
      const params = userSearch ? { search: userSearch } : undefined;
      const data = await usersApi.list(params);
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [userSearch]);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  useEffect(() => {
    fetchViewers();
    fetchSheets();
  }, [fetchViewers, fetchSheets]);

  useEffect(() => {
    if (showAddForm) {
      fetchUsers();
    }
  }, [showAddForm, fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewer.sheetId || !newViewer.viewerUserId) {
      setError('シートと閲覧者を選択してください');
      return;
    }

    try {
      setAdding(true);
      await viewersApi.create(newViewer);
      setShowAddForm(false);
      setNewViewer({ sheetId: '', viewerUserId: '' });
      await fetchViewers();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('追加閲覧者の登録に失敗しました');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (viewerId: string) => {
    if (!confirm('この閲覧者を削除しますか？')) {
      return;
    }

    try {
      setDeleting(viewerId);
      await viewersApi.delete(viewerId);
      await fetchViewers();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('追加閲覧者の削除に失敗しました');
      }
    } finally {
      setDeleting(null);
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

      {/* 期間フィルタ */}
      <div
        className="ab-bg-base ab-rounded-md ab-p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <div className="ab-flex ab-items-end ab-gap-4">
          <div style={{ flex: 1, maxWidth: '300px' }}>
            <Select
              label="評価期間"
              value={selectedPeriodId}
              options={[
                { value: '', label: 'すべての期間' },
                ...periods.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.year}年 ${halfLabels[p.half as Half]})`,
                })),
              ]}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
            />
          </div>
          {!showAddForm && (
            <Button variant="default" onClick={() => setShowAddForm(true)}>
              閲覧者を追加
            </Button>
          )}
        </div>
      </div>

      {/* 追加フォーム */}
      {showAddForm && (
        <div
          className="ab-bg-base ab-rounded-md ab-p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <h2 className="ab-text-heading-m ab-text-default ab-mb-4">
            追加閲覧者の登録
          </h2>
          <form onSubmit={handleAdd} className="ab-flex ab-flex-column ab-gap-4">
            <Select
              label="対象の評価シート"
              value={newViewer.sheetId}
              options={[
                { value: '', label: '選択してください' },
                ...sheets.map((s) => ({
                  value: s.id,
                  label: `${s.user.name} (${s.user.employeeNumber}) - ${s.period.name}`,
                })),
              ]}
              onChange={(e) =>
                setNewViewer({ ...newViewer, sheetId: e.target.value })
              }
              disabled={!selectedPeriodId}
            />
            {!selectedPeriodId && (
              <p className="ab-text-body-s ab-text-secondary">
                評価期間を選択してください
              </p>
            )}

            <div>
              <Textfield
                label="閲覧者を検索"
                placeholder="名前・メール・社員番号で検索"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <Select
              label="追加する閲覧者"
              value={newViewer.viewerUserId}
              options={[
                { value: '', label: '選択してください' },
                ...users.map((u) => ({
                  value: u.id,
                  label: `${u.name} (${u.employeeNumber}) - ${u.email}`,
                })),
              ]}
              onChange={(e) =>
                setNewViewer({ ...newViewer, viewerUserId: e.target.value })
              }
            />

            <div className="ab-flex ab-gap-2">
              <Button type="submit" variant="default" disabled={adding}>
                {adding ? '追加中...' : '追加'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => {
                  setShowAddForm(false);
                  setNewViewer({ sheetId: '', viewerUserId: '' });
                  setUserSearch('');
                }}
                disabled={adding}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 追加閲覧者一覧 */}
      <div
        className="ab-bg-base ab-rounded-md ab-p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <h2 className="ab-text-heading-m ab-text-default ab-mb-1">
          追加閲覧者一覧
        </h2>
        <p className="ab-text-body-s ab-text-secondary ab-mb-4">
          {viewers.length}件の追加閲覧者
        </p>

        {viewers.length === 0 ? (
          <p className="ab-text-body-m ab-text-secondary">
            追加閲覧者がまだ登録されていません
          </p>
        ) : (
          <div className="ab-flex ab-flex-column ab-gap-3">
            {viewers.map((viewer) => (
              <div
                key={viewer.id}
                className="ab-p-4 ab-rounded-md"
                style={{
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div className="ab-flex ab-items-start ab-justify-between">
                  <div>
                    <div className="ab-flex ab-items-center ab-gap-2 ab-mb-1">
                      <span className="ab-text-heading-s ab-text-default">
                        {viewer.viewer.name}
                      </span>
                      <span className="ab-text-body-s ab-text-secondary">
                        ({viewer.viewer.employeeNumber})
                      </span>
                    </div>
                    <p className="ab-text-body-s ab-text-secondary ab-mb-2">
                      {viewer.viewer.email}
                    </p>
                    <div
                      className="ab-p-2 ab-rounded-md"
                      style={{ backgroundColor: '#e3f2fd' }}
                    >
                      <p className="ab-text-body-s ab-text-default">
                        <strong>閲覧対象:</strong> {viewer.sheet.user.name}さんの
                        {viewer.sheet.period.name}
                      </p>
                    </div>
                    <p className="ab-text-body-xs ab-text-secondary ab-mt-2">
                      追加者: {viewer.creator.name} |{' '}
                      {new Date(viewer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outlined"
                    onClick={() => handleDelete(viewer.id)}
                    disabled={deleting === viewer.id}
                  >
                    {deleting === viewer.id ? '削除中...' : '削除'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
