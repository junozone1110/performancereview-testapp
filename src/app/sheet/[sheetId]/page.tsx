import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { EvaluationSheetClient } from '@/components/sheet/evaluation-sheet-client';
import { canEditSheet } from '@/lib/workflow';
import type { EvaluationSheet } from '@/types/evaluation';
import type { Role } from '@prisma/client';

// モックデータ（データベース接続後に置き換え）
function getMockSheet(sheetId: string): EvaluationSheet | null {
  return {
    id: sheetId,
    userId: 'user-1',
    periodId: 'period-1',
    status: 'goal_setting',
    user: {
      id: 'user-1',
      name: '山田 太郎',
      email: 'yamada@example.com',
      employeeNumber: 'EMP001',
    },
    period: {
      id: 'period-1',
      name: '2026年度上期',
      year: 2026,
      half: 'first',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-09-30'),
      currentPhase: 'goal_setting',
      isActive: true,
    },
    goals: [
      {
        id: 'goal-1',
        sheetId: sheetId,
        sortOrder: 1,
        title: '新規顧客獲得数の増加',
        description: '新規顧客を前期比120%獲得する',
        achievementCriteria: '新規顧客獲得数が前期比120%以上',
        weight: 30,
        selfEvaluation: null,
        managerEvaluation: null,
      },
      {
        id: 'goal-2',
        sheetId: sheetId,
        sortOrder: 2,
        title: 'チームの生産性向上',
        description: 'チーム全体の生産性を15%向上させる',
        achievementCriteria: '生産性指標が前期比115%以上',
        weight: 25,
        selfEvaluation: null,
        managerEvaluation: null,
      },
      {
        id: 'goal-3',
        sheetId: sheetId,
        sortOrder: 3,
        title: '顧客満足度の維持・向上',
        description: '顧客満足度調査でAランク以上を維持',
        achievementCriteria: '顧客満足度調査で90点以上',
        weight: 25,
        selfEvaluation: null,
        managerEvaluation: null,
      },
      {
        id: 'goal-4',
        sheetId: sheetId,
        sortOrder: 4,
        title: '業務プロセスの改善',
        description: '業務効率化のための改善提案を3件以上実施',
        achievementCriteria: '改善提案の採用数3件以上',
        weight: 20,
        selfEvaluation: null,
        managerEvaluation: null,
      },
    ],
    totalEvaluation: null,
  };
}

interface PageProps {
  params: Promise<{ sheetId: string }>;
}

export default async function SheetPage({ params }: PageProps) {
  const session = await auth();
  const { sheetId } = await params;

  if (!session?.user) {
    redirect('/login');
  }

  // モックデータを取得（データベース接続後に実際のクエリに置き換え）
  const sheet = getMockSheet(sheetId);

  if (!sheet) {
    redirect('/dashboard');
  }

  const userRoles = (session.user.roles || ['employee']) as Role[];
  const isOwner = sheet.userId === session.user.id || true; // モック用にtrueに
  const isManager = userRoles.includes('manager');

  // 編集権限を取得
  const editPermissions = canEditSheet(
    sheet.status,
    sheet.period.currentPhase,
    userRoles,
    isOwner,
    isManager
  );

  return (
    <MainLayout>
      <EvaluationSheetClient
        sheet={sheet}
        editPermissions={editPermissions}
        userRoles={userRoles}
        isOwner={isOwner}
        isManager={isManager}
      />
    </MainLayout>
  );
}
