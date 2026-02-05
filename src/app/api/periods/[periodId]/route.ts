import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/permissions';
import { getNextPhase, phaseOrder } from '@/lib/workflow';
import type { Role, Phase } from '@/types/enums';

interface RouteParams {
  params: Promise<{ periodId: string }>;
}

// GET /api/periods/[periodId] - 評価期間詳細取得
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { periodId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    if (!hasRole(userRoles, 'hr')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const period = await prisma.evaluationPeriod.findUnique({
      where: { id: periodId },
      include: {
        _count: {
          select: {
            sheets: true,
          },
        },
      },
    });

    if (!period) {
      return NextResponse.json({ error: '評価期間が見つかりません' }, { status: 404 });
    }

    // 各フェーズのシート数を集計
    const phaseStats = await prisma.evaluationSheet.groupBy({
      by: ['status'],
      where: { periodId },
      _count: true,
    });

    const phaseStatsMap = Object.fromEntries(
      phaseStats.map((stat) => [stat.status, stat._count])
    );

    return NextResponse.json({
      ...period,
      sheetsCount: period._count.sheets,
      phaseStats: phaseStatsMap,
      _count: undefined,
    });
  } catch (error) {
    console.error('Error fetching period:', error);
    return NextResponse.json({ error: '評価期間の取得に失敗しました' }, { status: 500 });
  }
}

// PATCH /api/periods/[periodId] - 評価期間更新（フェーズ切替等）
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { periodId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    if (!hasRole(userRoles, 'hr')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const body = await request.json();
    const { currentPhase, isActive } = body as {
      currentPhase?: Phase;
      isActive?: boolean;
    };

    const period = await prisma.evaluationPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      return NextResponse.json({ error: '評価期間が見つかりません' }, { status: 404 });
    }

    const updateData: { currentPhase?: Phase; isActive?: boolean } = {};

    // フェーズ切替
    if (currentPhase !== undefined) {
      // フェーズの順序チェック（逆方向への切替は警告のみ）
      const currentIndex = phaseOrder.indexOf(period.currentPhase);
      const newIndex = phaseOrder.indexOf(currentPhase);

      if (newIndex < currentIndex) {
        // 逆方向への切替は許可するが、警告をログに出力
        console.warn(
          `Phase reversal: ${period.currentPhase} -> ${currentPhase} for period ${periodId}`
        );
      }

      updateData.currentPhase = currentPhase;
    }

    // アクティブ状態の切替
    if (isActive !== undefined) {
      // 他のアクティブな期間を非アクティブにする
      if (isActive) {
        await prisma.evaluationPeriod.updateMany({
          where: { isActive: true, id: { not: periodId } },
          data: { isActive: false },
        });
      }
      updateData.isActive = isActive;
    }

    const updatedPeriod = await prisma.evaluationPeriod.update({
      where: { id: periodId },
      data: updateData,
    });

    return NextResponse.json(updatedPeriod);
  } catch (error) {
    console.error('Error updating period:', error);
    return NextResponse.json({ error: '評価期間の更新に失敗しました' }, { status: 500 });
  }
}

// DELETE /api/periods/[periodId] - 評価期間削除
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { periodId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    if (!hasRole(userRoles, 'hr')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const period = await prisma.evaluationPeriod.findUnique({
      where: { id: periodId },
      include: {
        _count: {
          select: { sheets: true },
        },
      },
    });

    if (!period) {
      return NextResponse.json({ error: '評価期間が見つかりません' }, { status: 404 });
    }

    // シートが存在する場合は削除不可
    if (period._count.sheets > 0) {
      return NextResponse.json(
        { error: 'シートが存在する評価期間は削除できません' },
        { status: 400 }
      );
    }

    await prisma.evaluationPeriod.delete({
      where: { id: periodId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting period:', error);
    return NextResponse.json({ error: '評価期間の削除に失敗しました' }, { status: 500 });
  }
}
