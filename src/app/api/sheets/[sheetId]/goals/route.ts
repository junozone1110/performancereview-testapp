import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { canEditSheet } from '@/lib/workflow';
import type { Role } from '@/types/enums';

interface RouteParams {
  params: Promise<{ sheetId: string }>;
}

// POST /api/sheets/[sheetId]/goals - 目標追加
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { sheetId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    // シート取得
    const sheet = await prisma.evaluationSheet.findUnique({
      where: { id: sheetId },
      include: {
        period: true,
        goals: true,
      },
    });

    if (!sheet) {
      return NextResponse.json({ error: 'シートが見つかりません' }, { status: 404 });
    }

    const isOwner = sheet.userId === session.user.id;
    const isManager = await prisma.periodAssignment.findFirst({
      where: {
        periodId: sheet.periodId,
        userId: sheet.userId,
        managerId: session.user.id,
      },
    }) !== null;

    // 編集権限チェック
    const editPermissions = canEditSheet(
      sheet.status,
      sheet.period.currentPhase,
      userRoles,
      isOwner,
      isManager
    );

    if (!editPermissions.canEditGoals) {
      return NextResponse.json({ error: '目標を追加する権限がありません' }, { status: 403 });
    }

    // 目標数チェック（最大6個）
    if (sheet.goals.length >= 6) {
      return NextResponse.json({ error: '目標は最大6個までです' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, achievementCriteria, weight } = body;

    // バリデーション
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: '目標概要は必須です' }, { status: 400 });
    }

    if (typeof weight !== 'number' || weight < 1 || weight > 40) {
      return NextResponse.json({ error: 'ウェイトは1〜40の範囲で指定してください' }, { status: 400 });
    }

    // 現在のウェイト合計をチェック
    const currentTotalWeight = sheet.goals.reduce((sum, g) => sum + g.weight, 0);
    if (currentTotalWeight + weight > 100) {
      return NextResponse.json(
        { error: `ウェイトの合計が100%を超えます（現在: ${currentTotalWeight}%）` },
        { status: 400 }
      );
    }

    // 目標作成
    const goal = await prisma.goal.create({
      data: {
        sheetId,
        sortOrder: sheet.goals.length + 1,
        title,
        description: description || null,
        achievementCriteria: achievementCriteria || null,
        weight,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: '目標の作成に失敗しました' }, { status: 500 });
  }
}
