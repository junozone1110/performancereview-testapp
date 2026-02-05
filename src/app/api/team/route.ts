import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasAnyRole } from '@/lib/permissions';
import type { Role } from '@prisma/client';

// GET /api/team - 部下一覧取得
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    if (!hasAnyRole(userRoles, ['manager', 'hr'])) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get('periodId');

    // 管理対象の従業員IDを取得
    const managedAssignments = await prisma.periodAssignment.findMany({
      where: {
        managerId: session.user.id,
        ...(periodId ? { periodId } : {}),
      },
      select: {
        userId: true,
        periodId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        currentGrade: true,
      },
    });

    if (managedAssignments.length === 0) {
      return NextResponse.json([]);
    }

    // ユニークなperiodIdを取得
    const periodIds = [...new Set(managedAssignments.map((a) => a.periodId))];
    const userIds = [...new Set(managedAssignments.map((a) => a.userId))];

    // 部下のシートを取得
    const sheets = await prisma.evaluationSheet.findMany({
      where: {
        userId: { in: userIds },
        periodId: { in: periodIds },
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
      orderBy: [{ period: { year: 'desc' } }, { user: { name: 'asc' } }],
    });

    // アサインメント情報をマップ
    const assignmentMap = new Map(
      managedAssignments.map((a) => [`${a.userId}-${a.periodId}`, a])
    );

    // シートに部署・等級情報を追加
    const sheetsWithDetails = sheets.map((sheet) => {
      const assignment = assignmentMap.get(`${sheet.userId}-${sheet.periodId}`);
      return {
        ...sheet,
        goalsCount: sheet.goals.length,
        totalWeight: sheet.goals.reduce((sum, g) => sum + g.weight, 0),
        goals: undefined,
        department: assignment?.department || null,
        currentGrade: assignment?.currentGrade || null,
      };
    });

    return NextResponse.json(sheetsWithDetails);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: '部下一覧の取得に失敗しました' }, { status: 500 });
  }
}
