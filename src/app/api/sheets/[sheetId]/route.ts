import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { canEditSheet } from '@/lib/workflow';
import type { Role, Phase } from '@prisma/client';

interface RouteParams {
  params: Promise<{ sheetId: string }>;
}

// シートへのアクセス権限をチェック
async function checkSheetAccess(
  sheetId: string,
  userId: string,
  userRoles: Role[]
): Promise<{ hasAccess: boolean; isOwner: boolean; isManager: boolean }> {
  const sheet = await prisma.evaluationSheet.findUnique({
    where: { id: sheetId },
    include: {
      period: true,
    },
  });

  if (!sheet) {
    return { hasAccess: false, isOwner: false, isManager: false };
  }

  const isOwner = sheet.userId === userId;

  // 管理職かどうかを別途チェック
  const isManager = await prisma.periodAssignment.findFirst({
    where: {
      periodId: sheet.periodId,
      userId: sheet.userId,
      managerId: userId,
    },
  }) !== null;

  // HRは全シートにアクセス可能
  if (hasPermission(userRoles, 'view_all_sheets')) {
    return { hasAccess: true, isOwner, isManager };
  }

  // 管理職は管理対象のシートにアクセス可能
  if (hasPermission(userRoles, 'view_team_sheets') && isManager) {
    return { hasAccess: true, isOwner, isManager };
  }

  // 自分のシートにはアクセス可能
  if (isOwner) {
    return { hasAccess: true, isOwner, isManager };
  }

  return { hasAccess: false, isOwner, isManager };
}

// GET /api/sheets/[sheetId] - シート詳細取得
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { sheetId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];
    const { hasAccess, isOwner, isManager } = await checkSheetAccess(
      sheetId,
      session.user.id,
      userRoles
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'このシートへのアクセス権限がありません' }, { status: 403 });
    }

    const sheet = await prisma.evaluationSheet.findUnique({
      where: { id: sheetId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeNumber: true,
          },
        },
        period: true,
        goals: {
          orderBy: { sortOrder: 'asc' },
          include: {
            selfEvaluation: true,
            managerEvaluation: true,
          },
        },
        totalEvaluation: true,
      },
    });

    if (!sheet) {
      return NextResponse.json({ error: 'シートが見つかりません' }, { status: 404 });
    }

    // 編集権限を計算
    const editPermissions = canEditSheet(
      sheet.status,
      sheet.period.currentPhase,
      userRoles,
      isOwner,
      isManager
    );

    // 従業員本人には上長評価・Mgr判断・HR判断を非表示
    const showManagerEvaluation = !isOwner || userRoles.includes('hr') || userRoles.includes('manager');
    const showMgrJudgment = userRoles.includes('hr') || (userRoles.includes('manager') && !isOwner);
    const showHrJudgment = userRoles.includes('hr') || (userRoles.includes('manager') && !isOwner);

    // 権限に応じてデータをフィルタ
    const filteredGoals = sheet.goals.map((goal) => ({
      ...goal,
      managerEvaluation: showManagerEvaluation ? goal.managerEvaluation : null,
    }));

    const filteredTotalEvaluation = sheet.totalEvaluation
      ? {
          ...sheet.totalEvaluation,
          mgrTreatment: showMgrJudgment ? sheet.totalEvaluation.mgrTreatment : null,
          mgrSalaryChange: showMgrJudgment ? sheet.totalEvaluation.mgrSalaryChange : null,
          mgrTreatmentComment: showMgrJudgment ? sheet.totalEvaluation.mgrTreatmentComment : null,
          mgrGrade: showMgrJudgment ? sheet.totalEvaluation.mgrGrade : null,
          mgrGradeComment: showMgrJudgment ? sheet.totalEvaluation.mgrGradeComment : null,
          hrTreatment: showHrJudgment ? sheet.totalEvaluation.hrTreatment : null,
          hrSalaryChange: showHrJudgment ? sheet.totalEvaluation.hrSalaryChange : null,
          hrGrade: showHrJudgment ? sheet.totalEvaluation.hrGrade : null,
        }
      : null;

    return NextResponse.json({
      ...sheet,
      goals: filteredGoals,
      totalEvaluation: filteredTotalEvaluation,
      editPermissions,
      isOwner,
      isManager,
    });
  } catch (error) {
    console.error('Error fetching sheet:', error);
    return NextResponse.json({ error: 'シートの取得に失敗しました' }, { status: 500 });
  }
}

// PATCH /api/sheets/[sheetId] - シートステータス更新
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { sheetId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];
    const { hasAccess, isOwner, isManager } = await checkSheetAccess(
      sheetId,
      session.user.id,
      userRoles
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'このシートへのアクセス権限がありません' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body as { status: Phase };

    if (!status) {
      return NextResponse.json({ error: 'ステータスは必須です' }, { status: 400 });
    }

    const sheet = await prisma.evaluationSheet.findUnique({
      where: { id: sheetId },
      include: { period: true },
    });

    if (!sheet) {
      return NextResponse.json({ error: 'シートが見つかりません' }, { status: 404 });
    }

    // ステータス遷移の権限チェック
    const editPermissions = canEditSheet(
      sheet.status,
      sheet.period.currentPhase,
      userRoles,
      isOwner,
      isManager
    );

    // 遷移可能かチェック（簡易版：HRは全ての遷移可能）
    if (!hasPermission(userRoles, 'edit_all_sheets')) {
      // 自己評価確定は本人のみ
      if (status === 'self_confirmed' && !isOwner) {
        return NextResponse.json({ error: '自己評価の確定は本人のみ可能です' }, { status: 403 });
      }
      // 上長評価確定は管理職のみ
      if (status === 'manager_confirmed' && !isManager) {
        return NextResponse.json({ error: '上長評価の確定は管理職のみ可能です' }, { status: 403 });
      }
    }

    const updatedSheet = await prisma.evaluationSheet.update({
      where: { id: sheetId },
      data: { status },
    });

    return NextResponse.json(updatedSheet);
  } catch (error) {
    console.error('Error updating sheet:', error);
    return NextResponse.json({ error: 'シートの更新に失敗しました' }, { status: 500 });
  }
}
