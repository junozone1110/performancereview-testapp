import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/permissions';
import type { Role } from '@/types/enums';

// GET /api/viewers - 追加閲覧者一覧取得（HR専用）
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
    const sheetId = searchParams.get('sheetId');
    const periodId = searchParams.get('periodId');

    // 追加閲覧者一覧を取得
    const viewers = await prisma.additionalViewer.findMany({
      where: {
        ...(sheetId ? { sheetId } : {}),
        ...(periodId ? { sheet: { periodId } } : {}),
      },
      include: {
        sheet: {
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
              },
            },
          },
        },
        viewer: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeNumber: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(viewers);
  } catch (error) {
    console.error('Error fetching viewers:', error);
    return NextResponse.json({ error: '追加閲覧者の取得に失敗しました' }, { status: 500 });
  }
}

// POST /api/viewers - 追加閲覧者を追加（HR専用）
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
    const { sheetId, viewerUserId } = body;

    if (!sheetId || !viewerUserId) {
      return NextResponse.json(
        { error: 'シートIDと閲覧者IDが必要です' },
        { status: 400 }
      );
    }

    // シートの存在確認
    const sheet = await prisma.evaluationSheet.findUnique({
      where: { id: sheetId },
    });

    if (!sheet) {
      return NextResponse.json({ error: '評価シートが見つかりません' }, { status: 404 });
    }

    // 閲覧者の存在確認
    const viewer = await prisma.user.findUnique({
      where: { id: viewerUserId },
    });

    if (!viewer) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    // シート所有者には追加閲覧者として登録不要
    if (sheet.userId === viewerUserId) {
      return NextResponse.json(
        { error: 'シート所有者を閲覧者として追加することはできません' },
        { status: 400 }
      );
    }

    // 既に追加済みかチェック
    const existing = await prisma.additionalViewer.findFirst({
      where: {
        sheetId,
        viewerUserId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'この閲覧者は既に追加されています' },
        { status: 400 }
      );
    }

    // 追加閲覧者を作成
    const additionalViewer = await prisma.additionalViewer.create({
      data: {
        sheetId,
        viewerUserId,
        createdBy: session.user.id,
      },
      include: {
        sheet: {
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
              },
            },
          },
        },
        viewer: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeNumber: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(additionalViewer, { status: 201 });
  } catch (error) {
    console.error('Error creating viewer:', error);
    return NextResponse.json({ error: '追加閲覧者の登録に失敗しました' }, { status: 500 });
  }
}
