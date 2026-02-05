import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { canEditSheet } from '@/lib/workflow';
import type { Role, CompetencyRating, Treatment, Grade } from '@prisma/client';

interface RouteParams {
  params: Promise<{ sheetId: string }>;
}

// PUT /api/sheets/[sheetId]/total-evaluation - 総評保存
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { sheetId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    // シート情報を取得
    const sheet = await prisma.evaluationSheet.findUnique({
      where: { id: sheetId },
      include: {
        period: true,
        totalEvaluation: true,
        goals: {
          include: {
            selfEvaluation: true,
          },
        },
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

    const body = await request.json();
    const {
      // コンピテンシーレベル（管理職が入力）
      competencyLevel,
      competencyLevelReason,
      // Mgr判断
      mgrTreatment,
      mgrSalaryChange,
      mgrTreatmentComment,
      mgrGrade,
      mgrGradeComment,
      // HR判断
      hrTreatment,
      hrSalaryChange,
      hrGrade,
    } = body as {
      competencyLevel?: CompetencyRating | null;
      competencyLevelReason?: string;
      mgrTreatment?: Treatment | null;
      mgrSalaryChange?: number | null;
      mgrTreatmentComment?: string;
      mgrGrade?: Grade | null;
      mgrGradeComment?: string;
      hrTreatment?: Treatment | null;
      hrSalaryChange?: number | null;
      hrGrade?: Grade | null;
    };

    // 権限に応じて更新可能なフィールドを制限
    const updateData: Record<string, unknown> = {};

    // Mgr判断の更新（管理職またはHR）
    if (editPermissions.canEditManagerEvaluation) {
      if (competencyLevel !== undefined) updateData.competencyLevel = competencyLevel;
      if (competencyLevelReason !== undefined) updateData.competencyLevelReason = competencyLevelReason || null;
      if (mgrTreatment !== undefined) updateData.mgrTreatment = mgrTreatment;
      if (mgrSalaryChange !== undefined) updateData.mgrSalaryChange = mgrSalaryChange;
      if (mgrTreatmentComment !== undefined) updateData.mgrTreatmentComment = mgrTreatmentComment || null;
      if (mgrGrade !== undefined) updateData.mgrGrade = mgrGrade;
      if (mgrGradeComment !== undefined) updateData.mgrGradeComment = mgrGradeComment || null;
    }

    // HR判断の更新（HRのみ）
    if (editPermissions.canEditHrEvaluation) {
      if (hrTreatment !== undefined) updateData.hrTreatment = hrTreatment;
      if (hrSalaryChange !== undefined) updateData.hrSalaryChange = hrSalaryChange;
      if (hrGrade !== undefined) updateData.hrGrade = hrGrade;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '更新する権限がありません' }, { status: 403 });
    }

    // 平均点を計算
    const goalsWithRating = sheet.goals.filter(
      (g) => g.selfEvaluation?.performanceRating != null
    );

    let averageScore = null;
    if (goalsWithRating.length > 0) {
      const ratingValues: Record<string, number> = {
        SS: 5,
        S: 4,
        A: 3,
        B: 2,
        C: 1,
      };

      const totalWeightedScore = goalsWithRating.reduce((sum, goal) => {
        const rating = goal.selfEvaluation!.performanceRating!;
        const value = ratingValues[rating];
        return sum + value * goal.weight;
      }, 0);

      const totalWeight = goalsWithRating.reduce((sum, goal) => sum + goal.weight, 0);
      averageScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) / 100 : null;
    }

    // 総評を作成または更新
    const totalEvaluation = await prisma.totalEvaluation.upsert({
      where: { sheetId },
      create: {
        sheetId,
        averageScore,
        ...updateData,
      },
      update: {
        averageScore,
        ...updateData,
      },
    });

    return NextResponse.json(totalEvaluation);
  } catch (error) {
    console.error('Error updating total evaluation:', error);
    return NextResponse.json({ error: '総評の保存に失敗しました' }, { status: 500 });
  }
}
