import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { hasRole } from '@/lib/permissions';

export default async function ImportPage() {
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
          <h1 className="text-2xl font-bold">組織インポート</h1>
          <p className="text-muted-foreground">CSVファイルから従業員・組織データをインポート</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CSVインポート</CardTitle>
            <CardDescription>従業員データをCSVファイルからインポートします</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">CSVアップロード機能は後続フェーズで実装予定です</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
