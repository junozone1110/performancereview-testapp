import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canEditSheet } from '@/lib/workflow';
import type { Role } from '@prisma/client';

interface RouteParams {
  params: Promise<{ goalId: string }>;
}

// 目標とシートへのアクセス権限をチェック
async function getGoalWithAccess(goalId: string, userId: string, userRoles: Role[]) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      sheet: {
        include: {
          period: true,
        },
      },
    },
  });

  if (!goal) {
    return null;
  }

  const isOwner = goal.sheet.userId === userId;
  const isManager = await prisma.periodAssignment.findFirst({
    where: {
      periodId: goal.sheet.periodId,
      userId: goal.sheet.userId,
      managerId: userId,
    },
  }) !== null;

  const editPermissions = canEditSheet(
    goal.sheet.status,
    goal.sheet.period.currentPhase,
    userRoles,
    isOwner,
    isManager
  );

  return { goal, isOwner, isManager, editPermissions };
}

// GET /api/goals/[goalId] - 目標詳細取得
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { goalId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        selfEvaluation: true,
        managerEvaluation: true,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: '目標が見つかりません' }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json({ error: '目標の取得に失敗しました' }, { status: 500 });
  }
}

// PUT /api/goals/[goalId] - 目標更新
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { goalId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];
    const result = await getGoalWithAccess(goalId, session.user.id, userRoles);

    if (!result) {
      return NextResponse.json({ error: '目標が見つかりません' }, { status: 404 });
    }

    const { goal, editPermissions } = result;

    if (!editPermissions.canEditGoals) {
      return NextResponse.json({ error: '目標を編集する権限がありません' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, achievementCriteria, weight, sortOrder } = body;

    // バリデーション
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return NextResponse.json({ error: '目標概要は必須です' }, { status: 400 });
    }

    if (weight !== undefined && (typeof weight !== 'number' || weight < 1 || weight > 40)) {
      return NextResponse.json({ error: 'ウェイトは1〜40の範囲で指定してください' }, { status: 400 });
    }

    // ウェイト変更時の合計チェック
    if (weight !== undefined && weight !== goal.weight) {
      const otherGoals = await prisma.goal.findMany({
        where: {
          sheetId: goal.sheetId,
          id: { not: goalId },
        },
      });
      const otherTotalWeight = otherGoals.reduce((sum, g) => sum + g.weight, 0);
      if (otherTotalWeight + weight > 100) {
        return NextResponse.json(
          { error: `ウェイトの合計が100%を超えます（他の目標の合計: ${otherTotalWeight}%）` },
          { status: 400 }
        );
      }
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(achievementCriteria !== undefined && { achievementCriteria: achievementCriteria || null }),
        ...(weight !== undefined && { weight }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: '目標の更新に失敗しました' }, { status: 500 });
  }
}

// DELETE /api/goals/[goalId] - 目標削除
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { goalId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];
    const result = await getGoalWithAccess(goalId, session.user.id, userRoles);

    if (!result) {
      return NextResponse.json({ error: '目標が見つかりません' }, { status: 404 });
    }

    const { goal, editPermissions } = result;

    if (!editPermissions.canEditGoals) {
      return NextResponse.json({ error: '目標を削除する権限がありません' }, { status: 403 });
    }

    // 目標と関連データを削除
    await prisma.$transaction(async (tx) => {
      // 自己評価を削除
      await tx.goalSelfEvaluation.deleteMany({
        where: { goalId },
      });
      // 上長評価を削除
      await tx.goalManagerEvaluation.deleteMany({
        where: { goalId },
      });
      // 目標を削除
      await tx.goal.delete({
        where: { id: goalId },
      });

      // 残りの目標のsortOrderを更新
      const remainingGoals = await tx.goal.findMany({
        where: { sheetId: goal.sheetId },
        orderBy: { sortOrder: 'asc' },
      });

      for (let i = 0; i < remainingGoals.length; i++) {
        await tx.goal.update({
          where: { id: remainingGoals[i].id },
          data: { sortOrder: i + 1 },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: '目標の削除に失敗しました' }, { status: 500 });
  }
}
