import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/permissions';
import type { Role, Phase } from '@/types/enums';

// GET /api/employees - 全従業員一覧取得（HR専用）
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    if (!hasRole(userRoles, 'hr')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get('periodId');
    const search = searchParams.get('search');
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');

    // アクティブな期間を取得（periodIdが指定されていない場合）
    let targetPeriodId = periodId;
    if (!targetPeriodId) {
      const activePeriod = await prisma.evaluationPeriod.findFirst({
        where: { isActive: true },
        select: { id: true },
      });
      targetPeriodId = activePeriod?.id || null;
    }

    // 全従業員のシートを取得
    const sheets = await prisma.evaluationSheet.findMany({
      where: {
        ...(targetPeriodId ? { periodId: targetPeriodId } : {}),
        ...(status ? { status: status as Phase } : {}),
        user: {
          isActive: true,
          ...(search
            ? {
                OR: [
                  { name: { contains: search } },
                  { email: { contains: search } },
                  { employeeNumber: { contains: search } },
                ],
              }
            : {}),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeNumber: true,
          },
        },
        period: {
          select: {
            id: true,
            name: true,
            year: true,
            half: true,
            currentPhase: true,
          },
        },
        goals: {
          select: {
            id: true,
            weight: true,
          },
        },
      },
      orderBy: [{ user: { name: 'asc' } }],
    });

    // 期間アサインメント情報を取得
    const sheetIds = sheets.map((s) => s.id);
    const assignments = await prisma.periodAssignment.findMany({
      where: {
        periodId: targetPeriodId || undefined,
        userId: { in: sheets.map((s) => s.userId) },
        ...(departmentId ? { departmentId } : {}),
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const assignmentMap = new Map(
      assignments.map((a) => [`${a.userId}-${a.periodId}`, a])
    );

    // 部署フィルタがある場合、該当するユーザーのみに絞る
    const filteredSheets = departmentId
      ? sheets.filter((sheet) => {
          const assignment = assignmentMap.get(`${sheet.userId}-${sheet.periodId}`);
          return assignment?.departmentId === departmentId;
        })
      : sheets;

    // シートに詳細情報を追加
    const sheetsWithDetails = filteredSheets.map((sheet) => {
      const assignment = assignmentMap.get(`${sheet.userId}-${sheet.periodId}`);
      return {
        ...sheet,
        goalsCount: sheet.goals.length,
        totalWeight: sheet.goals.reduce((sum, g) => sum + g.weight, 0),
        goals: undefined,
        department: assignment?.department || null,
        manager: assignment?.manager || null,
        currentGrade: assignment?.currentGrade || null,
      };
    });

    return NextResponse.json(sheetsWithDetails);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: '従業員一覧の取得に失敗しました' }, { status: 500 });
  }
}
