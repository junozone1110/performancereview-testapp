import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { hasAnyRole } from '@/lib/permissions';

export default async function TeamPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!hasAnyRole(session.user.roles, ['manager', 'hr'])) {
    redirect('/dashboard');
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">部下一覧</h1>
          <p className="text-muted-foreground">管理対象の従業員一覧</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>部下の評価シート</CardTitle>
            <CardDescription>管理対象従業員の評価状況</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">管理対象の従業員はまだ登録されていません</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
