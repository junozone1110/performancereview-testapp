import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">マイページ</h1>
          <p className="text-muted-foreground">
            {session.user.name}さん、こんにちは
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>評価シート</CardTitle>
              <CardDescription>現在の評価期間のシート</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                評価シートはまだありません
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>目標進捗</CardTitle>
              <CardDescription>目標の入力状況</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                目標はまだ設定されていません
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>現在のフェーズ</CardTitle>
              <CardDescription>評価サイクルの状態</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                評価期間が設定されていません
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
