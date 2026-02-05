import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/permissions';
import type { Role } from '@prisma/client';

// DELETE /api/viewers/[viewerId] - 追加閲覧者を削除（HR専用）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ viewerId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userRoles = (session.user.roles || ['employee']) as Role[];

    if (!hasRole(userRoles, 'hr')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const { viewerId } = await params;

    // 追加閲覧者の存在確認
    const viewer = await prisma.additionalViewer.findUnique({
      where: { id: viewerId },
    });

    if (!viewer) {
      return NextResponse.json({ error: '追加閲覧者が見つかりません' }, { status: 404 });
    }

    // 削除
    await prisma.additionalViewer.delete({
      where: { id: viewerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting viewer:', error);
    return NextResponse.json({ error: '追加閲覧者の削除に失敗しました' }, { status: 500 });
  }
}
