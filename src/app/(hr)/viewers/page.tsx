import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { hasRole } from '@/lib/permissions';

export default async function ViewersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!hasRole(session.user.roles, 'hr')) {
    redirect('/dashboard');
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">追加閲覧者設定</h1>
          <p className="text-muted-foreground">評価シートの追加閲覧者を設定</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>追加閲覧者一覧</CardTitle>
            <CardDescription>設定済みの追加閲覧者</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              追加閲覧者設定機能は後続フェーズで実装予定です
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
