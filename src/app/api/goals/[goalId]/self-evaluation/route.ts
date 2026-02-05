import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canEditSheet } from '@/lib/workflow';
import type { Role, PerformanceRating, CompetencyRating } from '@/types/enums';

interface RouteParams {
  params: Promise<{ goalId: string }>;
}

// PUT /api/goals/[goalId]/self-evaluation - 自己評価保存
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { goalId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    // 目標とシート情報を取得
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        sheet: {
          include: {
            period: true,
          },
        },
        selfEvaluation: true,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: '目標が見つかりません' }, { status: 404 });
    }

    const isOwner = goal.sheet.userId === session.user.id;
    const isManager = await prisma.periodAssignment.findFirst({
      where: {
        periodId: goal.sheet.periodId,
        userId: goal.sheet.userId,
        managerId: session.user.id,
      },
    }) !== null;

    // 編集権限チェック
    const editPermissions = canEditSheet(
      goal.sheet.status,
      goal.sheet.period.currentPhase,
      userRoles,
      isOwner,
      isManager
    );

    if (!editPermissions.canEditSelfEvaluation) {
      return NextResponse.json({ error: '自己評価を編集する権限がありません' }, { status: 403 });
    }

    const body = await request.json();
    const {
      performanceReflection,
      performanceRating,
      competencyReflection1,
      competencyReflection2,
      competencyReflection3,
      competencyRating,
    } = body as {
      performanceReflection?: string;
      performanceRating?: PerformanceRating | null;
      competencyReflection1?: string;
      competencyReflection2?: string;
      competencyReflection3?: string;
      competencyRating?: CompetencyRating | null;
    };

    // 自己評価を作成または更新
    const selfEvaluation = await prisma.goalSelfEvaluation.upsert({
      where: { goalId },
      create: {
        goalId,
        performanceReflection: performanceReflection || null,
        performanceRating: performanceRating || null,
        competencyReflection1: competencyReflection1 || null,
        competencyReflection2: competencyReflection2 || null,
        competencyReflection3: competencyReflection3 || null,
        competencyRating: competencyRating || null,
      },
      update: {
        performanceReflection: performanceReflection || null,
        performanceRating: performanceRating || null,
        competencyReflection1: competencyReflection1 || null,
        competencyReflection2: competencyReflection2 || null,
        competencyReflection3: competencyReflection3 || null,
        competencyRating: competencyRating || null,
      },
    });

    return NextResponse.json(selfEvaluation);
  } catch (error) {
    console.error('Error updating self evaluation:', error);
    return NextResponse.json({ error: '自己評価の保存に失敗しました' }, { status: 500 });
  }
}
