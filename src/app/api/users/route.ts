import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/permissions';
import type { Role } from '@/types/enums';

// GET /api/users - ユーザー一覧取得（HR専用）
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
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    // ユーザー一覧を取得
    const users = await prisma.user.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
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
      select: {
        id: true,
        name: true,
        email: true,
        employeeNumber: true,
        isActive: true,
        roles: {
          select: {
            role: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // ロールを配列に変換
    const usersWithRoles = users.map((user) => ({
      ...user,
      roles: user.roles.map((r) => r.role),
    }));

    return NextResponse.json(usersWithRoles);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'ユーザー一覧の取得に失敗しました' }, { status: 500 });
  }
}
