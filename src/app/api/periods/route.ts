import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/permissions';
import type { Role, Half, Phase } from '@prisma/client';

// GET /api/periods - 評価期間一覧取得
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    if (!hasRole(userRoles, 'hr')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const periods = await prisma.evaluationPeriod.findMany({
      orderBy: [{ year: 'desc' }, { half: 'desc' }],
      include: {
        _count: {
          select: {
            sheets: true,
          },
        },
      },
    });

    const periodsWithStats = periods.map((period) => ({
      ...period,
      sheetsCount: period._count.sheets,
      _count: undefined,
    }));

    return NextResponse.json(periodsWithStats);
  } catch (error) {
    console.error('Error fetching periods:', error);
    return NextResponse.json({ error: '評価期間の取得に失敗しました' }, { status: 500 });
  }
}

// POST /api/periods - 評価期間作成
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    if (!hasRole(userRoles, 'hr')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const body = await request.json();
    const { name, year, half, startDate, endDate } = body as {
      name: string;
      year: number;
      half: Half;
      startDate: string;
      endDate: string;
    };

    if (!name || !year || !half || !startDate || !endDate) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    // 同じ年度・半期の期間が既に存在するかチェック
    const existing = await prisma.evaluationPeriod.findFirst({
      where: { year, half },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'この年度・半期の評価期間は既に存在します' },
        { status: 400 }
      );
    }

    const period = await prisma.evaluationPeriod.create({
      data: {
        name,
        year,
        half,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        currentPhase: 'goal_setting',
        isActive: false,
      },
    });

    return NextResponse.json(period, { status: 201 });
  } catch (error) {
    console.error('Error creating period:', error);
    return NextResponse.json({ error: '評価期間の作成に失敗しました' }, { status: 500 });
  }
}
