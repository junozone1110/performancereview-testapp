import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { phaseLabels } from '@/lib/workflow';
import { halfLabels } from '@/types/evaluation';
import type { Phase, Half } from '@prisma/client';

// モックデータ（データベース接続後に置き換え）
interface MockSheet {
  id: string;
  periodName: string;
  year: number;
  half: Half;
  status: Phase;
  currentPhase: Phase;
  goalsCount: number;
  totalWeight: number;
}

function getMockSheets(): MockSheet[] {
  return [
    {
      id: 'sheet-1',
      periodName: '2026年度上期',
      year: 2026,
      half: 'first',
      status: 'goal_setting',
      currentPhase: 'goal_setting',
      goalsCount: 4,
      totalWeight: 100,
    },
  ];
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const sheets = getMockSheets();
  const currentSheet = sheets[0];

  return (
    <MainLayout>
      <div className="ab-flex ab-flex-column ab-gap-6">
        <div>
          <h1 className="ab-text-heading-l ab-text-default ab-mb-2">マイページ</h1>
          <p className="ab-text-body-m ab-text-secondary">{session.user.name}さん、こんにちは</p>
        </div>

        <div
          className="ab-grid ab-gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
        >
          {/* 評価シート */}
          <div
            className="ab-bg-base ab-rounded-md ab-p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <h2 className="ab-text-heading-m ab-text-default ab-mb-1">評価シート</h2>
            <p className="ab-text-body-s ab-text-secondary ab-mb-4">現在の評価期間のシート</p>
            {currentSheet ? (
              <div className="ab-flex ab-flex-column ab-gap-2">
                <p className="ab-text-body-m ab-text-default">
                  {currentSheet.year}年 {halfLabels[currentSheet.half]}
                </p>
                <div className="ab-flex ab-items-center ab-gap-2">
                  <span
                    className="ab-text-body-s ab-text-on-primary ab-rounded-md"
                    style={{ backgroundColor: '#1976d2', padding: '2px 8px' }}
                  >
                    {phaseLabels[currentSheet.status]}
                  </span>
                </div>
                <Link
                  href={`/sheet/${currentSheet.id}`}
                  className="ab-text-body-m"
                  style={{ color: '#1976d2', textDecoration: 'none' }}
                >
                  シートを開く →
                </Link>
              </div>
            ) : (
              <p className="ab-text-body-m ab-text-secondary">評価シートはまだありません</p>
            )}
          </div>

          {/* 目標進捗 */}
          <div
            className="ab-bg-base ab-rounded-md ab-p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <h2 className="ab-text-heading-m ab-text-default ab-mb-1">目標進捗</h2>
            <p className="ab-text-body-s ab-text-secondary ab-mb-4">目標の入力状況</p>
            {currentSheet ? (
              <div className="ab-flex ab-flex-column ab-gap-2">
                <p className="ab-text-body-m ab-text-default">
                  登録目標数: {currentSheet.goalsCount}/6
                </p>
                <p className="ab-text-body-m ab-text-default">
                  ウェイト合計: {currentSheet.totalWeight}%
                </p>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(currentSheet.totalWeight, 100)}%`,
                      height: '100%',
                      backgroundColor:
                        currentSheet.totalWeight === 100 ? '#4caf50' : '#ff9800',
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="ab-text-body-m ab-text-secondary">目標はまだ設定されていません</p>
            )}
          </div>

          {/* 現在のフェーズ */}
          <div
            className="ab-bg-base ab-rounded-md ab-p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <h2 className="ab-text-heading-m ab-text-default ab-mb-1">現在のフェーズ</h2>
            <p className="ab-text-body-s ab-text-secondary ab-mb-4">評価サイクルの状態</p>
            {currentSheet ? (
              <div className="ab-flex ab-flex-column ab-gap-2">
                <p className="ab-text-body-m ab-text-default">
                  {phaseLabels[currentSheet.currentPhase]}
                </p>
                <p className="ab-text-body-s ab-text-secondary">
                  {currentSheet.currentPhase === 'goal_setting' &&
                    '目標を入力してください'}
                  {currentSheet.currentPhase === 'goal_review' &&
                    '目標の確定を待っています'}
                  {currentSheet.currentPhase === 'self_evaluation' &&
                    '自己評価を入力してください'}
                  {currentSheet.currentPhase === 'self_confirmed' &&
                    '自己評価の確定を待っています'}
                  {currentSheet.currentPhase === 'manager_evaluation' &&
                    '上長評価を待っています'}
                  {currentSheet.currentPhase === 'manager_confirmed' &&
                    '上長評価の確定を待っています'}
                  {currentSheet.currentPhase === 'hr_evaluation' &&
                    'HR判断を待っています'}
                  {currentSheet.currentPhase === 'finalized' &&
                    '評価が確定しました'}
                </p>
              </div>
            ) : (
              <p className="ab-text-body-m ab-text-secondary">評価期間が設定されていません</p>
            )}
          </div>
        </div>

        {/* 過去の評価シート */}
        <div
          className="ab-bg-base ab-rounded-md ab-p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <h2 className="ab-text-heading-m ab-text-default ab-mb-1">過去の評価シート</h2>
          <p className="ab-text-body-s ab-text-secondary ab-mb-4">過去の評価期間のシート一覧</p>
          <p className="ab-text-body-m ab-text-secondary">過去のシートはありません</p>
        </div>
      </div>
    </MainLayout>
  );
}
