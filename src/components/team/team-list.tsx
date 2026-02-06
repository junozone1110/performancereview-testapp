'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { teamApi, type TeamMember, ApiError } from '@/lib/api-client';
import { phaseLabels } from '@/lib/workflow';
import { halfLabels, gradeLabels } from '@/types/evaluation';
import type { Phase, Half, Grade } from '@/types/enums';

export function TeamList() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const data = await teamApi.list();
        setMembers(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('部下一覧の取得に失敗しました');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeam();
  }, []);

  // 現在の期間でグループ化
  const currentPeriodMembers = members.filter(
    (m) => m.period.currentPhase !== 'finalized'
  );
  const pastPeriodMembers = members.filter(
    (m) => m.period.currentPhase === 'finalized'
  );

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

  if (members.length === 0) {
    return (
      <div
        className="ab-bg-base ab-rounded-md ab-p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <p className="ab-text-body-m ab-text-secondary">
          管理対象の従業員はまだ登録されていません
        </p>
      </div>
    );
  }

  return (
    <div className="ab-flex ab-flex-column ab-gap-6">
      {/* 現在の評価期間 */}
      {currentPeriodMembers.length > 0 && (
        <div
          className="ab-bg-base ab-rounded-md ab-p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <h2 className="ab-text-heading-m ab-text-default ab-mb-1">
            現在の評価期間
          </h2>
          <p className="ab-text-body-s ab-text-secondary ab-mb-4">
            {currentPeriodMembers[0]?.period.year}年{' '}
            {halfLabels[currentPeriodMembers[0]?.period.half as Half]}（
            {currentPeriodMembers[0]?.period.name}）
          </p>

          <div className="ab-flex ab-flex-column ab-gap-2">
            {currentPeriodMembers.map((member) => (
              <Link
                key={member.id}
                href={`/sheet/${member.id}`}
                className="ab-flex ab-items-center ab-justify-between ab-p-3 ab-rounded-md"
                style={{
                  textDecoration: 'none',
                  backgroundColor: '#f5f5f5',
                  transition: 'background-color 0.2s',
                }}
              >
                <div className="ab-flex ab-flex-column ab-gap-1">
                  <span className="ab-text-body-m ab-text-default">
                    {member.user.name}
                  </span>
                  <span className="ab-text-body-s ab-text-secondary">
                    {member.department?.name || '-'} /{' '}
                    {gradeLabels[member.currentGrade as Grade] || '-'}
                  </span>
                </div>
                <div className="ab-flex ab-items-center ab-gap-3">
                  <div className="ab-flex ab-flex-column ab-items-end ab-gap-1">
                    <span
                      className="ab-text-body-s ab-text-on-primary ab-rounded-md"
                      style={{ backgroundColor: '#1976d2', padding: '2px 8px' }}
                    >
                      {phaseLabels[member.status as Phase]}
                    </span>
                    <span className="ab-text-body-s ab-text-secondary">
                      目標: {member.goalsCount}/6 | ウェイト: {member.totalWeight}%
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
      )}

      {/* 過去の評価期間 */}
      {pastPeriodMembers.length > 0 && (
        <div
          className="ab-bg-base ab-rounded-md ab-p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <h2 className="ab-text-heading-m ab-text-default ab-mb-1">
            過去の評価期間
          </h2>
          <p className="ab-text-body-s ab-text-secondary ab-mb-4">
            確定済みの評価シート
          </p>

          <div className="ab-flex ab-flex-column ab-gap-2">
            {pastPeriodMembers.map((member) => (
              <Link
                key={member.id}
                href={`/sheet/${member.id}`}
                className="ab-flex ab-items-center ab-justify-between ab-p-3 ab-rounded-md"
                style={{
                  textDecoration: 'none',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <div className="ab-flex ab-flex-column ab-gap-1">
                  <span className="ab-text-body-m ab-text-default">
                    {member.user.name}
                  </span>
                  <span className="ab-text-body-s ab-text-secondary">
                    {member.period.year}年 {halfLabels[member.period.half as Half]}
                  </span>
                </div>
                <span
                  className="ab-text-body-s ab-rounded-md"
                  style={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    padding: '2px 8px',
                  }}
                >
                  確定済
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
