import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { hasRole } from '@/lib/permissions';

export default async function PeriodsPage() {
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
          <h1 className="text-2xl font-bold">評価期間管理</h1>
          <p className="text-muted-foreground">評価期間の作成とフェーズ管理</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>評価期間一覧</CardTitle>
            <CardDescription>作成済みの評価期間</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">評価期間がまだ作成されていません</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
