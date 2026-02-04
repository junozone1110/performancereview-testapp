import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { hasRole } from '@/lib/permissions';

export default async function EmployeesPage() {
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
          <h1 className="text-2xl font-bold">全従業員一覧</h1>
          <p className="text-muted-foreground">全従業員の評価シート一覧</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>従業員検索</CardTitle>
            <CardDescription>名前、部署、ステータスで検索</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">従業員データがまだ登録されていません</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
