import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import type { Role } from '@prisma/client';

// GET /api/sheets - シート一覧取得
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get('periodId');

    let sheets;

    if (hasPermission(userRoles, 'view_all_sheets')) {
      // HRは全シートを閲覧可能
      sheets = await prisma.evaluationSheet.findMany({
        where: periodId ? { periodId } : undefined,
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
        orderBy: { createdAt: 'desc' },
      });
    } else if (hasPermission(userRoles, 'view_team_sheets')) {
      // 管理職は自分のシートと管理対象従業員のシートを閲覧可能
      const managedUserIds = await prisma.periodAssignment.findMany({
        where: { managerId: session.user.id },
        select: { userId: true },
      });

      const userIds = [session.user.id, ...managedUserIds.map((a) => a.userId)];

      sheets = await prisma.evaluationSheet.findMany({
        where: {
          userId: { in: userIds },
          ...(periodId ? { periodId } : {}),
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
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // 従業員は自分のシートのみ閲覧可能
      sheets = await prisma.evaluationSheet.findMany({
        where: {
          userId: session.user.id,
          ...(periodId ? { periodId } : {}),
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
        orderBy: { createdAt: 'desc' },
      });
    }

    // サマリー情報を追加
    const sheetsWithSummary = sheets.map((sheet) => ({
      ...sheet,
      goalsCount: sheet.goals.length,
      totalWeight: sheet.goals.reduce((sum, g) => sum + g.weight, 0),
      goals: undefined, // 一覧では詳細な目標情報は不要
    }));

    return NextResponse.json(sheetsWithSummary);
  } catch (error) {
    console.error('Error fetching sheets:', error);
    return NextResponse.json({ error: 'シートの取得に失敗しました' }, { status: 500 });
  }
}
