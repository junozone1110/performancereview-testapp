'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button, Textfield } from '@giftee/abukuma-react';
import { employeesApi, type EmployeeSheet, ApiError } from '@/lib/api-client';
import { phaseLabels } from '@/lib/workflow';
import { gradeLabels } from '@/types/evaluation';
import type { Phase, Grade } from '@prisma/client';

export function EmployeesList() {
  const [employees, setEmployees] = useState<EmployeeSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await employeesApi.list({
        search: search || undefined,
      });
      setEmployees(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('従業員一覧の取得に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // フェーズごとにグループ化
  const groupedByPhase = employees.reduce(
    (acc, emp) => {
      const phase = emp.status as Phase;
      if (!acc[phase]) {
        acc[phase] = [];
      }
      acc[phase].push(emp);
      return acc;
    },
    {} as Record<Phase, EmployeeSheet[]>
  );

  if (error) {
    return (
      <div
        className="ab-bg-base ab-rounded-md ab-p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f44336' }}
      >
        <p className="ab-text-body-m" style={{ color: '#f44336' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="ab-flex ab-flex-column ab-gap-6">
      {/* 検索 */}
      <div
        className="ab-bg-base ab-rounded-md ab-p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <h2 className="ab-text-heading-m ab-text-default ab-mb-1">従業員検索</h2>
        <p className="ab-text-body-s ab-text-secondary ab-mb-4">
          名前、メールアドレス、社員番号で検索
        </p>
        <form onSubmit={handleSearch} className="ab-flex ab-gap-2">
          <div style={{ flex: 1 }}>
            <Textfield
              placeholder="検索キーワード"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="default">
            検索
          </Button>
          {search && (
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setSearch('');
                setSearchInput('');
              }}
            >
              クリア
            </Button>
          )}
        </form>
      </div>

      {/* 結果 */}
      {isLoading ? (
        <div
          className="ab-bg-base ab-rounded-md ab-p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <p className="ab-text-body-m ab-text-secondary">読み込み中...</p>
        </div>
      ) : employees.length === 0 ? (
        <div
          className="ab-bg-base ab-rounded-md ab-p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <p className="ab-text-body-m ab-text-secondary">
            {search ? '検索結果がありません' : '従業員データがまだ登録されていません'}
          </p>
        </div>
      ) : (
        <>
          {/* サマリー */}
          <div
            className="ab-bg-base ab-rounded-md ab-p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <h2 className="ab-text-heading-m ab-text-default ab-mb-4">
              フェーズ別サマリー
            </h2>
            <div
              className="ab-grid ab-gap-2"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
            >
              {Object.entries(phaseLabels).map(([phase, label]) => (
                <div
                  key={phase}
                  className="ab-flex ab-items-center ab-justify-between ab-p-2 ab-rounded-md"
                  style={{ backgroundColor: '#f5f5f5' }}
                >
                  <span className="ab-text-body-s ab-text-secondary">{label}</span>
                  <span className="ab-text-body-m ab-text-default">
                    {groupedByPhase[phase as Phase]?.length || 0}名
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 従業員一覧 */}
          <div
            className="ab-bg-base ab-rounded-md ab-p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <h2 className="ab-text-heading-m ab-text-default ab-mb-1">
              従業員一覧
            </h2>
            <p className="ab-text-body-s ab-text-secondary ab-mb-4">
              {employees.length}名
            </p>

            <div className="ab-flex ab-flex-column ab-gap-2">
              {employees.map((emp) => (
                <Link
                  key={emp.id}
                  href={`/sheet/${emp.id}`}
                  className="ab-flex ab-items-center ab-justify-between ab-p-3 ab-rounded-md"
                  style={{
                    textDecoration: 'none',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <div className="ab-flex ab-flex-column ab-gap-1">
                    <div className="ab-flex ab-items-center ab-gap-2">
                      <span className="ab-text-body-m ab-text-default">
                        {emp.user.name}
                      </span>
                      <span className="ab-text-body-s ab-text-secondary">
                        ({emp.user.employeeNumber})
                      </span>
                    </div>
                    <span className="ab-text-body-s ab-text-secondary">
                      {emp.department?.name || '-'} /{' '}
                      {gradeLabels[emp.currentGrade as Grade] || '-'} / 上長:{' '}
                      {emp.manager?.name || '-'}
                    </span>
                  </div>
                  <div className="ab-flex ab-items-center ab-gap-3">
                    <div className="ab-flex ab-flex-column ab-items-end ab-gap-1">
                      <span
                        className="ab-text-body-s ab-text-on-primary ab-rounded-md"
                        style={{
                          backgroundColor:
                            emp.status === 'finalized' ? '#4caf50' : '#1976d2',
                          padding: '2px 8px',
                        }}
                      >
                        {phaseLabels[emp.status as Phase]}
                      </span>
                      <span className="ab-text-body-s ab-text-secondary">
                        目標: {emp.goalsCount}/6 | ウェイト: {emp.totalWeight}%
                      </span>
                    </div>
                    <span className="ab-text-body-m" style={{ color: '#1976d2' }}>
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
